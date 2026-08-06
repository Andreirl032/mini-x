import { Router } from "express";
import {
  deletePost,
  dislikePost,
  editPost,
  getPostFromId,
  getPosts,
  likePost,
  postPost,
} from "../controllers/post.controller";
import authenticateToken from "../middlewares/auth.middleware";

const postRouter = Router();

postRouter.get("/posts/:postId", getPostFromId);

postRouter.use(authenticateToken);

postRouter.get("/posts", getPosts);

postRouter.post("/posts", postPost);

postRouter.patch("/posts/:postId", editPost);

postRouter.delete("/posts/:postId", deletePost);

postRouter.post("/posts/:postId/likes", likePost);

postRouter.delete("/posts/:postId/likes", dislikePost);

export default postRouter;
