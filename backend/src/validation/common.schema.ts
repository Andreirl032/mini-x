import { z } from "zod";

export const cuidParam = z.cuid2("Invalid ID format.");

export const userIdParamsSchema = z.object({
  id: cuidParam,
});

export const postIdParamsSchema = z.object({
  postId: cuidParam,
});

export const paginationQuerySchema = z.object({
  cursor: cuidParam.optional(),
});
