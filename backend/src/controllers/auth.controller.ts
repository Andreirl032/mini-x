import { Request, Response } from "express";
import {
  loginUser,
  logoutUser,
  refreshUserToken,
} from "../services/auth.service";
import dotenv from "dotenv";
import { AppError } from "../errors/AppError";
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

export async function refreshToken(req: Request, res: Response) {
  // Adquire refresh token original
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  try {
    // Adquire o objeto do banco de dados relativo ao refresh token original, cria novo refresh token, cria novo access token
    const { newRefreshToken, accessToken } = await refreshUserToken(
      refreshToken,
      req?.ip,
      req?.headers["user-agent"],
    );

    //Cria cookie com novo refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Retorna o access token para o frontend (com o cookie criado)
    return res.json({ accessToken: accessToken });
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      res.clearCookie("refreshToken");
    }

    throw error;
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    await logoutUser(refreshToken);
    res.clearCookie("refreshToken");
  }
  return res.status(200).json({ message: "Logout realizado com sucesso" });
}
