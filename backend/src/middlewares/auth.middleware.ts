import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }

  try {
    req.user = verifyAccessToken(token);
    next();
    return;
  } catch {
    // 401 so the client can refresh; 403 is reserved for forbidden actions
    return res.status(401).json({ error: { message: "Invalid or expired token" } });
  }
}

export default authenticateToken;
