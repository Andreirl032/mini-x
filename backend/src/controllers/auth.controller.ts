import { Request, Response } from "express";
import {
  loginUser,
  logoutUser,
  refreshUserToken,
} from "../services/auth.service";
import { AppError } from "../errors/AppError";
import { apiSuccess } from "../utils/apiResponse";
import { env } from "../config/env";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  const { accessToken, refreshToken } = await loginUser(
    username,
    password,
    userAgent,
    ipAddress,
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json(apiSuccess({ accessToken }));
}

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  try {
    const { newRefreshToken, accessToken } = await refreshUserToken(
      refreshToken,
      req?.ip,
      req?.headers["user-agent"],
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json(apiSuccess({ accessToken }));
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      res.clearCookie("refreshToken");
    }

    throw error;
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await logoutUser(refreshToken);
  }
  res.clearCookie("refreshToken");
  return res.json(apiSuccess(null, { message: "Logged out successfully" }));
}
