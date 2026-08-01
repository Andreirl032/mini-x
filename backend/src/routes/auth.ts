import { Router } from "express";
import dotenv from "dotenv";
import { login, logout, refreshToken } from "../controllers/auth.controller";

dotenv.config();

const loginRouter = Router();

//Autenticação do usuário
loginRouter.post("/login", login);

loginRouter.post("/refreshToken", refreshToken);

loginRouter.post("/logout", logout);

export default loginRouter;
