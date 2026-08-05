import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";

export async function getPostsDb(take: number, cursor?: string) {
  const postsDb = await prisma.post.findMany({
    take: take,
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
  });

  return postsDb;
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

export async function getLikesPostDb(postId: string) {
  return await prisma.like.findMany({
    where: {
      post_id: postId,
    },
  });
}
