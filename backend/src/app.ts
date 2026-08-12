import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import errorHandler from "./middlewares/errorHandler.middleware";
import loginRouter from "./routes/auth";
import postRouter from "./routes/post";
import userRouter from "./routes/user";
import { env } from "./config/env";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(loginRouter);
app.use(postRouter);
app.use(userRouter);

app.use(errorHandler);
export default app;
