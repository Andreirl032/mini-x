import { Request, Response } from "express";
import { getPostfromIdDb, getPostsDb } from "../services/post.service";

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
