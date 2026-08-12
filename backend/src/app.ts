import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.middleware";
import loginRouter from "./routes/auth";
import postRouter from "./routes/post";
import userRouter from "./routes/user";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

//ROTAS
app.use(loginRouter);

//POSTAGENS
app.use(postRouter);

//USUÁRIOS
app.use(userRouter);

app.use(errorHandler);
export default app;

// app.get('/', (req, res) => {
//   return res.json({ message: 'API do Mini-Twitter rodando com sucesso!' });
// });
