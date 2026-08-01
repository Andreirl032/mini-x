import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../errors/AppError";
import prisma from "../database/prisma";

export async function loginUser(
  username: string,
  password: string,
  userAgent: string | undefined,
  ipAddress: string | undefined,
) {
  // Consulta de banco pelo nome de usuário
  const userDb = await prisma.user.findUnique({
    where: { username: username },
  });

  // Erros de senha e ausência de campos
  if (!userDb || !userDb.password) {
    throw new AppError("Invalid username or password", 401);
  }
  const isPasswordValid = await bcrypt.compare(password, userDb.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid username or password", 401);
  }

  // Criação do payload e access token
  const jwtPayload = {
    id: userDb.id,
  };
  const accessToken = jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "5m",
  });

  // Limpeza de refresh tokens no banco já expirados
  await prisma.session.deleteMany({
    where: {
      user_id: userDb.id,
      OR: [{ expires_at: { lt: new Date() } }, { user_agent: userAgent }],
    },
  });

  // Criação de novo refresh token
  const refreshToken = crypto.randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      user_id: userDb.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7 dias

      ip_address: ipAddress,
      user_agent: userAgent,
    },
  });

  // Envio do access e refresh tokens
  return { accessToken, refreshToken };
}

export async function refreshUserToken(
  refreshToken: string,
  ipAddress: string | undefined,
  userAgent: string | undefined,
) {
  const refreshTokenDb = await prisma.session.findUnique({
    where: {
      token: refreshToken,
    },
  });
  if (!refreshTokenDb) {
    throw new AppError("Refresh token not found", 401);
  }

  // Se refresh token original expirou, limpa o cookie de refresh token
  if (refreshTokenDb.expires_at < new Date()) {
    await prisma.session.delete({
      where: {
        token: refreshToken,
      },
    });
    throw new AppError("Expired session! Log in again.", 401);
  }

  const newRefreshToken = crypto.randomBytes(32).toString("hex");
  await prisma.session.update({
    where: {
      token: refreshToken,
    },
    data: {
      user_id: refreshTokenDb.user_id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7 dias

      ip_address: ipAddress,
      user_agent: userAgent,
    },
  });

  const jwtPayload = {
    id: refreshTokenDb.user_id,
  };
  const accessToken = jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "5m",
  });

  return { newRefreshToken, accessToken };
}
