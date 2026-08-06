import { Router } from "express";
import authenticateToken from "../middlewares/auth.middleware";
import { createUser, deleteUser, editUser, follow, unfollow, viewFollowers, viewFollowing, viewUser, viewUserLikes, viewUserPosts } from "../controllers/user.controller";

const userRouter = Router();


// Criar usuário
userRouter.post("/users",createUser)

userRouter.use(authenticateToken);

// Editar usuário
userRouter.patch("/users/:id",editUser)

// Visualizar conta
userRouter.get("/users/:id",viewUser)

// Visualizar posts
userRouter.get("/users/:id/posts",viewUserPosts)

// Visualizar curtidas
userRouter.get("/users/:id/likes",viewUserLikes)

//Visualizar seguidores
userRouter.get("/users/:id/followers",viewFollowers)

//Visualizar seguindo
userRouter.get("/users/:id/following",viewFollowing)

//Seguir
userRouter.post("/users/:id/follow",follow)

//Deixar de seguir
userRouter.delete("/users/:id/follow",unfollow)

// Deletar conta
userRouter.delete("/users/:id",deleteUser)