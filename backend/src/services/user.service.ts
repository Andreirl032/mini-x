import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password?: string;
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

  const password = !data.password
    ? undefined
    : await bcrypt.hash(data.password, 10);

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
  const checkUserExists = await prisma.user.findFirst({
    where: { AND: [{ username: data.username }, { NOT: { id: userId } }] },
  });
  if (checkUserExists) {
    throw new AppError("Username already exists", 409);
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
          posts: true,
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

export async function viewFollowersDb(parameters: any) {
  // Lógica de banco para buscar quem segue este usuário
}

export async function viewFollowingDb(parameters: any) {
  // Lógica de banco para buscar quem este usuário está seguindo
}

export async function followDb(parameters: any) {
  // Lógica de banco para criar a relação de seguidor
}

export async function unfollowDb(parameters: any) {
  // Lógica de banco para deletar a relação de seguidor
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
