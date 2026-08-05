import { Request, Response } from "express";
import {
  dislikePostDb,
  getPostfromIdDb,
  getPostsDb,
  likePostDb,
} from "../services/post.service";

export async function getPosts(req: Request, res: Response) {
  const take = 10;
  const cursor = req.query.cursor as string | undefined;

  const posts = await getPostsDb(take, cursor);

  const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

  return res.json({ posts: posts, nextCursor: nextCursor });
}

export async function getPostFromId(req: Request, res: Response) {
  const postId = req.params.id as string;

  const post = await getPostfromIdDb(postId);

  return res.json({ post: post });
}

export async function likePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const userId = req.user.user_id;

  const like = await likePostDb(postId, userId);

  return res.status(201).json({ like: like });
}

export async function dislikePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
  const userId = req.user.user_id;

  await dislikePostDb(postId, userId);

  return res.sendStatus(204);
}
