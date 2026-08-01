import { Router } from "express";
import { getPostFromId, getPosts } from "../controllers/post.controller";
import authenticateToken from "../middlewares/auth.middleware";

const postRouter = Router();

postRouter.get("/posts/:id",getPostFromId);

postRouter.use(authenticateToken)

postRouter.get("/posts",getPosts);

postRouter.post("/posts");

postRouter.put("/posts/:id");

postRouter.delete("/posts/:id");

export default postRouter;