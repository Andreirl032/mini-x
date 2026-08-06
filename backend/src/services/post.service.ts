import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";

export async function getPostsDb(take: number, cursor?: string) {
  const postsDb = await prisma.post.findMany({
    take: take+1,
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
    where: { parent_id: null },
  });

  let nextCursor: string | null = null;

  if (postsDb.length > take) {
    const nextItem = postsDb.pop();
    nextCursor = nextItem?.id || null;
  }

  return { posts: postsDb, nextCursor };
}

export async function getPostfromIdDb(postId: string) {
  const postsDb = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      user: {
        select: { username: true, name: true, profile_picture: true },
      },
      _count: {
        select: { likes: true, replies: true },
      },
    },
  });

  if (!postsDb) {
    throw new AppError("Post not found", 404);
  }

  return postsDb;
}

export async function postPostDb(
  userId: string,
  parentId: string | undefined,
  body: string | undefined,
  image: string | undefined,
) {
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
  await prisma.post.update({
    where: { id: postId, user_id: userId },
    data: { body: body, image: image },
  });
}

export async function deletePostDb(
  userId: string,
  postId: string,
  parentId: string | undefined,
) {
  if (!parentId) {
    await prisma.post.delete({
      where: { id: postId, user_id: userId },
    });
  } else {
    await prisma.post.update({
      where: { id: postId, user_id: userId },
      data: { is_deleted: true },
    });
  }
}

export async function likePostDb(postId: string, userId: string) {
  const like = await prisma.like.create({
    data: { post_id: postId, user_id: userId },
  });
  if (!like) {
    throw new AppError("Failed to like post");
  }
  return like;
}

export async function unlikePostDb(postId: string, userId: string) {
  const unlike = await prisma.like.delete({
    where: {
      user_id_post_id: {
        user_id: userId,
        post_id: postId,
      },
    },
  });
  return unlike;
}
