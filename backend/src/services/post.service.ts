import prisma from "../database/prisma";

export async function getPostsDb(take: number, cursor?: string) {
  const postsDb = await prisma.post.findMany({
    take: take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { created_at: "desc" },
  });

  return postsDb;
}
