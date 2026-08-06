import { Request, Response, NextFunction } from "express";

export function requireAccountOwner(req: Request, res: Response, next: NextFunction) {
  // ID da conta que está tentando ser acessada na URL (/users/:id)
  const targetUserId = req.params.id; 
  // ID de quem está logado no momento (veio do authenticateToken)
  const loggedInUserId = req.user.user_id; 

  if (targetUserId !== loggedInUserId) {
    return res.status(403).json({ message: "Você não tem permissão para alterar esta conta." });
  }

  next(); // Pode passar para o Controller!
}