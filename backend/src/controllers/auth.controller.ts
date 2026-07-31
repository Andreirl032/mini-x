import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import dotenv from "dotenv";
dotenv.config();

export async function login(req: Request, res: Response) {
  // Aquisição de informações do usuário pela requisição
  const { username, password } = req.body;
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  // Access e refresh tokens
  const { accessToken, refreshToken } = await loginUser(
    username,
    password,
    userAgent,
    ipAddress,
  );

  // Salvamento do refresh token em cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Envio do access token pro frontend (junto do cookie do refresh token salvo)
  return res.json({ accessToken: accessToken });
}
