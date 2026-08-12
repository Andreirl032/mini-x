import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export default function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Token inválido: segue como visitante anônimo
  }

  return next();
}
