import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues.map((issue) => issue.message),
      });
    }

    // Substitui o body pela versão "limpa" e validada pelo Zod
    req.body = result.data; 
    return next();
  };
};