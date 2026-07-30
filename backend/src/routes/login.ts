// import express from "express"
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// import path from "path";
// import dotenv from "dotenv"

// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = Router();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

//Autenticar usuário
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDb = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!userDb || !userDb.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, userDb.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const jwtPayload = {
      id: userDb.id,
      username: userDb.username,
    };

    const accessToken = jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET!);
    return res.json({ accessToken: accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  //"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYW5kcmVpIiwicGFzc3dvcmQiOiIxMjM0NTYiLCJpYXQiOjE3ODUzNDc1MjJ9.ejhUP5He01MbNaQPvVxj8f19RhVnyhVZCdfUO22Ok8E"
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export default router;
