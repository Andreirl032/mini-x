import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";
import bcrypt from "bcryptjs";
import { Prisma } from "../generated/prisma/client";

export interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  birthDate?: string; // Vem como string do frontend
  city?: string;
  countryCode?: string;
  googleId?: string;
}

export interface EditUserData {
  username?: string;
  name?: string;
  profilePicture?: string;
  bio?: string;
  city?: string;
  countryCode?: string;
}

export async function createUserDb(data: CreateUserData) {
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (userExists) {
    throw new AppError("Username ou E-mail já estão em uso.", 409); // 409 = Conflict
  }

  // const password = !data.password
  //   ? undefined
  //   : await bcrypt.hash(data.password, 10);
  const password = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      name: data.name,
      email: data.email,
      role: "USER",
      password: password,
      profile_picture: data.profilePicture,
      bio: data.bio,
      birth_date: data.birthDate ? new Date(data.birthDate) : undefined,
      city: data.city,
      country_code: data.countryCode,
      google_id: data.googleId,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      profile_picture: true,
      bio: true,
      created_at: true,
    },
  });

  return user;
}

export async function editUserDb(userId: string, data: EditUserData) {
  if (data.username) {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError("Username already in use", 409);
    }
  }

  const user = await prisma.user.update({
    data: {
      username: data.username,
      name: data.name,
      profile_picture: data.profilePicture,
      bio: data.bio,
      city: data.city,
      country_code: data.countryCode,
    },
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      profile_picture: true,
      bio: true,
      created_at: true,
    },
  });

  return user;
}

export async function viewUserDb(userId: string, selfId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      name: true,
      bio: true,
      profile_picture: true,
      birth_date: true,
      city: true,
      country_code: true,
      created_at: true,
      _count: {
        select: {
          posts: { where: { is_deleted: false } },
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isFollowing = selfId
    ? await prisma.follow.findUnique({
        where: {
          followed_id_follower_id: {
            followed_id: userId,
            follower_id: selfId,
          },
        },
      })
    : false;

  return { user: user, isFollowing: !!isFollowing };
}

export async function viewUserPostsDb(
  userId: string,
  take: number,
  selfId?: string,
  cursor?: string,
) {
  const limit = selfId ? take : Math.floor(take / 2);
  const postsDb = await prisma.post.findMany({
    take: selfId ? limit + 1 : limit,
    ...(cursor && selfId ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
    include: {
      user: {
        select: { username: true, name: true, profile_picture: true },
      },
      _count: {
        select: { likes: true, replies: true },
      },
    },
    where: {
      user_id: userId,
      parent_id: null,
      is_deleted: false,
    },
  });

  if (!selfId) {
    return { posts: postsDb, nextCursor: null };
  }

  let nextCursor: string | null = null;

  if (postsDb.length > limit) {
    const nextItem = postsDb.pop();
    nextCursor = nextItem?.id || null;
  }

  return { posts: postsDb, nextCursor };
}

export async function viewUserRepliesDb(
  userId: string,
  take: number,
  cursor?: string,
) {
  const postsDb = await prisma.post.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
    include: {
      user: {
        select: { username: true, name: true, profile_picture: true },
      },
      _count: {
        select: { likes: true, replies: true },
      },
    },
    where: {
      user_id: userId,
      parent_id: { not: null },
      is_deleted: false,
    },
  });

  let nextCursor: string | null = null;

  if (postsDb.length > take) {
    const nextItem = postsDb.pop();
    nextCursor = nextItem?.id || null;
  }

  return { posts: postsDb, nextCursor };
}

export async function viewUserLikesDb(
  userId: string,
  take: number,
  cursor?: string,
) {
  const postsDb = await prisma.like.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
    where: {
      // likes: { some: { user_id: userId } },
      user_id: userId,
      post: { is_deleted: false },
    },

    select: {
      id: true,
      post: {
        include: {
          user: {
            select: { username: true, name: true, profile_picture: true },
          },
          _count: {
            select: { likes: true, replies: true },
          },
        },
      },
    },
  });

  let nextCursor: string | null = null;

  if (postsDb.length > take) {
    const nextItem = postsDb.pop();
    nextCursor = nextItem?.id || null;
  }

  const formattedPosts = postsDb.map((item) => item.post);

  return { posts: formattedPosts, nextCursor };
}

export async function viewFollowersDb(
  userId: string,
  take: number,
  cursor?: string,
) {
  const followersDb = await prisma.follow.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
    where: {
      followed_id: userId,
    },

    select: {
      id: true,
      follower: {
        select: {
          id: true,
          username: true,
          name: true,
          profile_picture: true,
          bio: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;

  if (followersDb.length > take) {
    const nextItem = followersDb.pop();
    nextCursor = nextItem?.id || null;
  }

  const formattedFollowers = followersDb.map((item) => item.follower);

  return { followers: formattedFollowers, nextCursor };
}

export async function viewFollowingDb(
  userId: string,
  take: number,
  cursor?: string,
) {
  const followingDb = await prisma.follow.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
    where: {
      follower_id: userId,
    },

    select: {
      id: true,
      followed: {
        select: {
          id: true,
          username: true,
          name: true,
          profile_picture: true,
          bio: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;

  if (followingDb.length > take) {
    const nextItem = followingDb.pop();
    nextCursor = nextItem?.id || null;
  }

  const formattedFollowing = followingDb.map((item) => item.followed);

  return { following: formattedFollowing, nextCursor };
}

export async function followDb(userId: string, selfId: string) {
  if (userId === selfId)
    throw new AppError("A user cannot follow themselves", 400);
  await prisma.follow
    .create({
      data: { followed_id: userId, follower_id: selfId },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new AppError("Follow relation already exists", 409);
        }
      }
    });
}

export async function unfollowDb(userId: string, selfId: string) {
  await prisma.follow
    .delete({
      where: {
        followed_id_follower_id: { followed_id: userId, follower_id: selfId },
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new AppError("Follow relation does not exist", 404);
        }
      }
    });
}

export async function deleteUserDb(userId: string) {
  // Consulta os posts
  const userPosts = await prisma.post.findMany({
    where: { user_id: userId },
    include: {
      _count: { select: { replies: true } },
    },
  });

  // Soft delete nos posts com filhos
  const postOperations = userPosts.map((post) => {
    if (post._count.replies > 0) {
      return prisma.post.update({
        where: { id: post.id },
        data: { is_deleted: true, body: null, image: null },
      });
    }
    // Hard delete nos posts sem filhos
    else {
      return prisma.post.delete({
        where: { id: post.id },
      });
    }
  });

  await prisma.$transaction([
    ...postOperations,
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
