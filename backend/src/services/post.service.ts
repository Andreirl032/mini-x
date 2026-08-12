import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";

const postInclude = {
  user: {
    select: { username: true, name: true, profile_picture: true },
  },
  _count: {
    select: { likes: true, replies: true },
  },
} as const;

function paginatePosts<T extends { id: string }>(posts: T[], take: number) {
  let nextCursor: string | null = null;

  if (posts.length > take) {
    const nextItem = posts.pop();
    nextCursor = nextItem?.id || null;
  }

  return { posts, nextCursor };
}

export async function getPostsDb(take: number, cursor?: string) {
  const postsDb = await prisma.post.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
    include: postInclude,
    where: { parent_id: null, is_deleted: false },
  });

  return paginatePosts(postsDb, take);
}

export async function getFeedFollowingDb(
  userId: string,
  take: number,
  cursor?: string,
) {
  const following = await prisma.follow.findMany({
    where: { follower_id: userId },
    select: { followed_id: true },
  });

  const authorIds = [
    userId,
    ...following.map((relation) => relation.followed_id),
  ];

  const postsDb = await prisma.post.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
    include: postInclude,
    where: {
      user_id: { in: authorIds },
      parent_id: null,
      is_deleted: false,
    },
  });

  return paginatePosts(postsDb, take);
}

export async function getPostfromIdDb(postId: string) {
  const postsDb = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: postInclude,
  });

  if (!postsDb || postsDb.is_deleted) {
    throw new AppError("Post not found", 404);
  }

  return postsDb;
}

export async function getPostRepliesDb(
  postId: string,
  take: number,
  cursor?: string,
) {
  const parentPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, is_deleted: true },
  });

  if (!parentPost || parentPost.is_deleted) {
    throw new AppError("Post not found", 404);
  }

  const repliesDb = await prisma.post.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "asc" },
    include: postInclude,
    where: {
      parent_id: postId,
      is_deleted: false,
    },
  });

  return paginatePosts(repliesDb, take);
}

export async function postPostDb(
  userId: string,
  parentId: string | undefined,
  body: string | undefined,
  image: string | undefined,
) {
  if (parentId) {
    const parentPost = await prisma.post.findUnique({
      where: { id: parentId },
      select: { id: true, is_deleted: true },
    });

    if (!parentPost || parentPost.is_deleted) {
      throw new AppError("Parent post not found", 404);
    }
  }

  await prisma.post.create({
    data: { user_id: userId, parent_id: parentId, body: body, image: image },
  });
}

export async function editPostDb(
  userId: string,
  postId: string,
  body: string | undefined,
  image: string | undefined,
) {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post || post.is_deleted) throw new AppError("Post not found", 404);
  if (post.user_id !== userId) throw new AppError("Unauthorized", 403);

  await prisma.post.update({
    where: { id: postId },
    data: { body, image },
  });
}

export async function deletePostDb(userId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      _count: { select: { replies: true } },
    },
  });

  if (!post || post.is_deleted) {
    throw new AppError("Post not found", 404);
  }

  if (post.user_id !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (post._count.replies > 0) {
    await prisma.post.update({
      where: { id: postId },
      data: { is_deleted: true, body: null, image: null },
    });
  } else {
    await prisma.post.delete({
      where: { id: postId },
    });
  }
}

export async function likePostDb(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, is_deleted: true },
  });

  if (!post || post.is_deleted) {
    throw new AppError("Post not found", 404);
  }

  try {
    return await prisma.like.create({
      data: { post_id: postId, user_id: userId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Already liked", 409);
    }
    throw error;
  }
}

export async function unlikePostDb(postId: string, userId: string) {
  try {
    return await prisma.like.delete({
      where: {
        user_id_post_id: {
          user_id: userId,
          post_id: postId,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Like not found", 404);
    }
    throw error;
  }
}
