import { Router } from "express";
import dotenv from "dotenv";
import { getPosts } from "../controllers/post.controller";

dotenv.config();

const postRouter = Router();

postRouter.get("/posts",getPosts);

postRouter.get("/posts:id");

postRouter.post("/posts");

postRouter.put("/posts:id");

postRouter.delete("/posts:id");

export default postRouter;