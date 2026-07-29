import express from "express";
import cors from "cors";

import loginRoutes from "./routes/login";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);
app.use(express.json());

//ROTAS
app.use(loginRoutes);

export default app;

// app.get('/', (req, res) => {
//   return res.json({ message: 'API do Mini-Twitter rodando com sucesso!' });
// });
