import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/auth.controller";

const loginRouter = Router();

//Autenticação do usuário
loginRouter.post("/login", login);

loginRouter.post("/refreshToken", refreshToken);

loginRouter.post("/logout", logout);

export default loginRouter;
