import { Request, Response, NextFunction } from "express";

export function requireAccountOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const targetUserId = req.params.id;
  const loggedInUserId = req.user!.user_id;

  if (targetUserId !== loggedInUserId) {
    return res.status(403).json({
      error: { message: "Você não tem permissão para alterar esta conta." },
    });
  }

  next();
  return;
}
