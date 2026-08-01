import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";

export async function getPostsDb(take: number, cursor?: string) {
  const postsDb = await prisma.post.findMany({
    take: take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
  });

  return postsDb;
}

export async function getPostfromIdDb(postId: string) {
  const postsDb = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!postsDb) {
    throw new AppError("Post not found", 404);
  }

  return postsDb;
}
