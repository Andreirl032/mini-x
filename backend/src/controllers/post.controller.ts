import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  deletePostDb,
  unlikePostDb,
  editPostDb,
  getPostfromIdDb,
  getPostsDb,
  getFeedFollowingDb,
  getPostRepliesDb,
  likePostDb,
  postPostDb,
} from "../services/post.service";
import { uploadImageToSupabase } from "../services/storage.service";
import { apiSuccess } from "../utils/apiResponse";

const PAGE_SIZE = 10;

async function uploadPostImage(
  userId: string,
  file: Express.Multer.File,
): Promise<string> {
  const fileExtension = file.mimetype.split("/")[1];
  const fileName = `${userId}-${Date.now()}.${fileExtension}`;

  return uploadImageToSupabase(
    file.buffer,
    fileName,
    file.mimetype,
    "posts",
  );
}

export async function getPosts(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const { posts, nextCursor } = await getPostsDb(PAGE_SIZE, cursor);

  return res.json(apiSuccess({ posts }, { nextCursor }));
}

export async function getFeedFollowing(req: Request, res: Response) {
  const userId = req.user!.user_id;
  const cursor = req.query.cursor as string | undefined;
  const { posts, nextCursor } = await getFeedFollowingDb(
    userId,
    PAGE_SIZE,
    cursor,
  );

  return res.json(apiSuccess({ posts }, { nextCursor }));
}

export async function getPostFromId(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const post = await getPostfromIdDb(postId);

  return res.json(apiSuccess({ post }));
}

export async function getPostReplies(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const cursor = req.query.cursor as string | undefined;
  const { posts, nextCursor } = await getPostRepliesDb(
    postId,
    PAGE_SIZE,
    cursor,
  );

  return res.json(apiSuccess({ posts }, { nextCursor }));
}

export async function postPost(req: Request, res: Response) {
  const userId = req.user!.user_id;
  const { parentId, body } = req.body;

  if (!body && !req.file) {
    throw new AppError("A post must contain either text or an image.", 400);
  }

  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = await uploadPostImage(userId, req.file);
  }

  await postPostDb(userId, parentId, body, imageUrl);

  return res.status(201).json(apiSuccess(null));
}

export async function editPost(req: Request, res: Response) {
  const userId = req.user!.user_id;
  const postId = req.params.postId as string;
  const { body } = req.body;

  if (body === undefined && !req.file) {
    throw new AppError(
      "Provide at least one field to update (body or image).",
      400,
    );
  }

  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = await uploadPostImage(userId, req.file);
  }

  await editPostDb(userId, postId, body, imageUrl);

  return res.json(apiSuccess(null));
}

export async function deletePost(req: Request, res: Response) {
  const userId = req.user!.user_id;
  const postId = req.params.postId as string;
  await deletePostDb(userId, postId);

  return res.json(apiSuccess(null));
}

export async function likePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const userId = req.user!.user_id;
  const like = await likePostDb(postId, userId);

  return res.status(201).json(apiSuccess({ like }));
}

export async function unlikePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const userId = req.user!.user_id;
  await unlikePostDb(postId, userId);

  return res.json(apiSuccess(null));
}
