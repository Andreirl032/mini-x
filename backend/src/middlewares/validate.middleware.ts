import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodTypeAny } from "zod";

type ValidationTarget = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

function isZodObject(schema: unknown): schema is ZodObject {
  return (
    typeof schema === "object" &&
    schema !== null &&
    "safeParseAsync" in schema
  );
}

export const validate = (schemas: ValidationTarget | ZodObject) => {
  const targets: ValidationTarget = isZodObject(schemas)
    ? { body: schemas }
    : schemas;

  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const key of ["body", "params", "query"] as const) {
      const schema = targets[key];
      if (!schema) continue;

      const result = await schema.safeParseAsync(req[key]);

      if (!result.success) {
        errors.push(...result.error.issues.map((issue) => issue.message));
        continue;
      }

      req[key] = result.data;
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          message: "Validation failed",
          details: errors,
        },
      });
    }

    return next();
  };
};
