import { Request, Response, NextFunction } from "express";

export function requireAccountOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const targetUserId = req.params.id;
  const loggedInUserId = req.user?.user_id;

  if (!loggedInUserId || targetUserId !== loggedInUserId) {
    return res.status(403).json({
      error: {
        message: "You do not have permission to modify this account.",
      },
    });
  }

  next();
  return;
}
