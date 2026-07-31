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
