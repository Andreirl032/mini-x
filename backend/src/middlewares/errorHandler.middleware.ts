import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message },
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: { message: err.message },
    });
  }

  if (err instanceof Error && err.message === "Only image files are allowed") {
    return res.status(400).json({
      error: { message: err.message },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { message: "Internal server error" },
  });
}

export default errorHandler;
