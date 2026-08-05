import { Router } from "express";
import { dislikePost, getLikesPost, getPostFromId, getPosts, likePost } from "../controllers/post.controller";
import authenticateToken from "../middlewares/auth.middleware";

const postRouter = Router();

postRouter.get("/posts/:id",getPostFromId);

postRouter.use(authenticateToken)

postRouter.get("/posts",getPosts);

postRouter.post("/posts");

postRouter.put("/posts/:id");

postRouter.delete("/posts/:id");

postRouter.get("/posts/:id/likes",getLikesPost);

postRouter.post("/posts/:id/likes", likePost);

postRouter.delete("/posts/:id/likes", dislikePost);

export default postRouter;