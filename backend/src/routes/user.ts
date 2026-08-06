import { Router } from "express";
import authenticateToken from "../middlewares/auth.middleware";

const userRouter = Router();


// Criar usuário
userRouter.post("/users")

userRouter.use(authenticateToken);

// Editar usuário
userRouter.patch("/users/:id")

// Visualizar conta
userRouter.get("/users/:id")

// Visualizar posts
userRouter.get("/users/:id/posts")

// Visualizar curtidas
userRouter.get("/users/:id/likes")

//Visualizar seguidores
userRouter.get("/users/:id/followers")

//Seguir
userRouter.post("/users/:id/follow")

//Deixar de seguir
userRouter.delete("/users/:id/follow")

// Deletar conta
userRouter.delete("/users/:id")