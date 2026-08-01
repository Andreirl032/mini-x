import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const postRouter = Router();

postRouter.get("/posts");

postRouter.get("/posts:id");

postRouter.post("/posts");

postRouter.put("/posts:id");

postRouter.delete("/posts:id");

export default postRouter;