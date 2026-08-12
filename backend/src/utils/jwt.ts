import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types/jwt";

export function signAccessToken(userId: string): string {
  const payload: JwtPayload = { user_id: userId };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
}
