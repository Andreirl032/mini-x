import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.middleware";
import authenticateToken from "./middlewares/auth.middleware";
import loginRouter from "./routes/auth";
import postRouter from "./routes/post";

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

//NECESSIDADE DE AUTENTICAÇÃO
app.use(authenticateToken);

//POSTAGENS
app.use(postRouter);

app.use(errorHandler);
export default app;

// app.get('/', (req, res) => {
//   return res.json({ message: 'API do Mini-Twitter rodando com sucesso!' });
// });
