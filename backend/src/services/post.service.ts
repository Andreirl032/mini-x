import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";

export async function getPostsDb(take: number, cursor?: string) {
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
    where: { parent_id: null, is_deleted: false },
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
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post || post.is_deleted) throw new AppError("Post not found", 404);
  if (post.user_id !== userId) throw new AppError("Unauthorized", 403);

  await prisma.post.update({
    where: { id: postId },
    data: { body, image },
  });
}

export async function deletePostDb(userId: string, postId: string) {
  // 1. Busca o post e JÁ conta as respostas (replies) na mesma viagem ao banco
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      _count: { select: { replies: true } },
    },
  });

  // 2. Verifica se o post existe e se não está deletado
  if (!post || post.is_deleted) {
    throw new AppError("Post not found", 404);
  }

  // 3. Verifica se o usuário é o dono do post
  if (post.user_id !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  // 4. Se tiver respostas, faz o Soft Delete
  if (post._count.replies > 0) {
    await prisma.post.update({
      where: { id: postId },
      data: { is_deleted: true, body: null, image: null },
    });
  } 
  // 5. Se não tiver respostas, faz o Hard Delete
  else {
    await prisma.post.delete({
      where: { id: postId },
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
