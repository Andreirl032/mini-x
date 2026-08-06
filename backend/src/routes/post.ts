import { Router } from "express";
import {
  deletePost,
  unlikePost,
  editPost,
  getPostFromId,
  getPosts,
  likePost,
  postPost,
} from "../controllers/post.controller";
import authenticateToken from "../middlewares/auth.middleware";

const postRouter = Router();

// Visualizar post
postRouter.get("/posts/:postId", getPostFromId);

postRouter.use(authenticateToken);

// Feed de posts
postRouter.get("/posts", getPosts);

// Postar uma postagem
postRouter.post("/posts", postPost);

// Editar post
postRouter.patch("/posts/:postId", editPost);

// Deletar post
postRouter.delete("/posts/:postId", deletePost);

// Curtir post
postRouter.post("/posts/:postId/likes", likePost);

// Descurtir post
postRouter.delete("/posts/:postId/likes", unlikePost);

export default postRouter;
