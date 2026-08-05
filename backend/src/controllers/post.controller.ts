import { Request, Response } from "express";
import {
  getLikesPostDb,
  getPostfromIdDb,
  getPostsDb,
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

export async function getLikesPost(req: Request, res: Response) {
  const postId = req.params.postId as string;
  return res.json({ likes: getLikesPostDb(postId) });
}

export async function likePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
}

export async function dislikePost(req: Request, res: Response) {
  const postId = req.params.postId as string;
}
