import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(); 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; 
    return next();
  } catch (error) {
    return next(); 
  }
}