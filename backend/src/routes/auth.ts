// import express from "express"
import { Router } from "express";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { login, refreshToken } from "../controllers/auth.controller";

dotenv.config();

const loginRouter = Router();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

//Autenticar usuário
loginRouter.post("/login", login);

loginRouter.post("/refreshToken", refreshToken);

loginRouter.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await prisma.session.delete({
      where: {
        token: refreshToken,
      },
    });
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
});

export default loginRouter;
