import { Request, Response } from "express";
import dotenv from "dotenv";
import { getPostsDb } from "../services/post.service";
dotenv.config();

export async function getPosts(req: Request, res: Response) {
  const take = 10;
  const cursor = req.query.cursor as string | undefined;

  const posts = await getPostsDb(take, cursor);

  const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

  return res.json({ posts: posts, nextCursor: nextCursor });
}
