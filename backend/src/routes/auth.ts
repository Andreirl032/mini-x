import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validation/auth.schema";
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: "Too many login attempts" } },
});


const loginRouter = Router();

loginRouter.post("/login", loginLimiter, validate({ body: loginSchema }), login);
loginRouter.post("/refreshToken", refreshToken);
loginRouter.post("/logout", logout);

export default loginRouter;
