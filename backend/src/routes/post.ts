import { Router } from "express";
import {
  dislikePost,
  editPost,
  getPostFromId,
  getPosts,
  likePost,
  postPost,
} from "../controllers/post.controller";
import authenticateToken from "../middlewares/auth.middleware";

const postRouter = Router();

postRouter.get("/posts/:id", getPostFromId);

postRouter.use(authenticateToken);

postRouter.get("/posts", getPosts);

postRouter.post("/posts", postPost);

postRouter.put("/posts/:id",editPost);

postRouter.delete("/posts/:id");

postRouter.post("/posts/:id/likes", likePost);

postRouter.delete("/posts/:id/likes", dislikePost);

export default postRouter;
