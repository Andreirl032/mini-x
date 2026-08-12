import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AppError } from "../errors/AppError";
import prisma from "../database/prisma";
import { signAccessToken } from "../utils/jwt";

export async function loginUser(
  username: string,
  password: string,
  userAgent: string | undefined,
  ipAddress: string | undefined,
) {
  const userDb = await prisma.user.findUnique({
    where: { username: username },
  });

  if (!userDb || !userDb.password) {
    throw new AppError("Invalid username or password", 401);
  }
  const isPasswordValid = await bcrypt.compare(password, userDb.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid username or password", 401);
  }

  const accessToken = signAccessToken(userDb.id);

  await prisma.session.deleteMany({
    where: {
      user_id: userDb.id,
      OR: [{ expires_at: { lt: new Date() } }],
    },
  });

  const refreshToken = crypto.randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      user_id: userDb.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

      ip_address: ipAddress,
      user_agent: userAgent,
    },
  });

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
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

      ip_address: ipAddress,
      user_agent: userAgent,
    },
  });

  const accessToken = signAccessToken(refreshTokenDb.user_id);

  return { newRefreshToken, accessToken };
}

export async function logoutUser(refreshToken: string) {
  await prisma.session.deleteMany({
    where: {
      token: refreshToken,
    },
  });
}
