import { Request, Response } from "express";
import {
  deletePostDb,
  unlikePostDb,
  editPostDb,
  getPostfromIdDb,
  getPostsDb,
  likePostDb,
  postPostDb,
} from "../services/post.service";

export async function getPosts(req: Request, res: Response) {
  const take = 10;
  const cursor = req.query.cursor as string | undefined;

  const { posts, nextCursor } = await getPostsDb(take, cursor);

  return res.json({ posts: posts, nextCursor: nextCursor });
}

export async function getPostFromId(req: Request, res: Response) {
  const postId = req.params.postId as string;

  const post = await getPostfromIdDb(postId);

  return res.json({ post: post });
}

export async function postPost(req: Request, res: Response) {
  const userId = req.user.user_id;
  const { parentId, body, image } = req.body;
  await postPostDb(userId, parentId, body, image);

  return res.sendStatus(201);
}

export async function editPost(req: Request, res: Response) {
  const userId = req.user.user_id;
  const postId = req.params.postId as string;
  const { body, image } = req.body;
  await editPostDb(userId, postId, body, image);

  return res.sendStatus(200);
}

export async function deletePost(req: Request, res: Response) {
  const userId = req.user.user_id;
  const postId = req.params.postId as string;
  await deletePostDb(userId, postId);

  return res.sendStatus(200);
}

export async function likePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const userId = req.user.user_id;

  const like = await likePostDb(postId, userId);

  return res.status(201).json({ like: like });
}

export async function unlikePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const userId = req.user.user_id;

  await unlikePostDb(postId, userId);

  return res.sendStatus(204);
}
