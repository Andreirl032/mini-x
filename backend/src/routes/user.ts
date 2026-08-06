import { Router } from "express";
import authenticateToken from "../middlewares/auth.middleware";
import {
  createUser,
  deleteUser,
  editUser,
  follow,
  unfollow,
  viewFollowers,
  viewFollowing,
  viewUser,
  viewUserLikes,
  viewUserPosts,
  viewUserReplies,
} from "../controllers/user.controller";
import { requireAccountOwner } from "../middlewares/accountOwner.middleware";
import optionalAuth from "../middlewares/optionalAuth.middleware";

const userRouter = Router();

// Criar usuário
userRouter.post("/users", createUser);

// Visualizar conta
userRouter.get("/users/:id", optionalAuth, viewUser);

// Visualizar posts
userRouter.get("/users/:id/posts", optionalAuth, viewUserPosts);

userRouter.use(authenticateToken);

// Visualizar respostas
userRouter.get("/users/:id/replies", viewUserReplies);

//Seguir
userRouter.post("/users/:id/follow", follow);

//Deixar de seguir
userRouter.delete("/users/:id/follow", unfollow);

//Visualizar seguidores
userRouter.get("/users/:id/followers", viewFollowers);

//Visualizar seguindo
userRouter.get("/users/:id/following", viewFollowing);

userRouter.use(requireAccountOwner);

// Editar usuário
userRouter.patch("/users/:id", editUser);

// Visualizar curtidas
userRouter.get("/users/:id/likes", viewUserLikes);

// Deletar conta
userRouter.delete("/users/:id", deleteUser);
