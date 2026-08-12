import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validation/auth.schema";

const loginRouter = Router();

//Autenticação do usuário
loginRouter.post("/login", validate(loginSchema), login);

loginRouter.post("/refreshToken", refreshToken);

loginRouter.post("/logout", logout);

export default loginRouter;
