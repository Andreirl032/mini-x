// import express from "express"
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const loginRouter = Router();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

//Autenticar usuário
loginRouter.post("/login", async (req, res) => {
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
    };

    const accessToken = jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "5m",
    });

    await prisma.session.deleteMany({
      where: {
        user_id: userDb.id,
        OR: [
          { expires_at: { lt: new Date() } },
          { user_agent: req?.headers["user-agent"] },
        ],
      },
    });

    const refreshToken = crypto.randomBytes(32).toString("hex");
    await prisma.session.create({
      data: {
        user_id: userDb.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7 dias

        ip_address: req?.ip,
        user_agent: req?.headers["user-agent"],
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

loginRouter.post("/refreshToken", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(401);
    }
    const refreshTokenDb = await prisma.session.findUnique({
      where: {
        token: refreshToken,
      },
    });
    if (!refreshTokenDb) {
      return res.sendStatus(401);
    }
    if (refreshTokenDb.expires_at < new Date()) {
      await prisma.session.delete({
        where: {
          token: refreshToken,
        },
      });
      res.clearCookie("refreshToken");
      return res
        .status(401)
        .json({ message: "Expired session! Log in again." });
    }

    const jwtPayload = {
      id: refreshTokenDb.user_id,
    };
    const accessToken = jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "5m",
    });

    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    await prisma.session.update({
      where: {
        token: refreshToken,
      },
      data: {
        user_id: refreshTokenDb.user_id,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7 dias

        ip_address: req?.ip,
        user_agent: req?.headers["user-agent"],
      },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ accessToken: accessToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

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
