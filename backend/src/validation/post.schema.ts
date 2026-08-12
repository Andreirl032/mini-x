import { z } from "zod";

export const createPostBodySchema = z.object({
  body: z
    .string()
    .max(500, "Post cannot exceed 500 characters.")
    .optional(),
  parentId: z.cuid2("Invalid parent ID format.").optional(),
});

export const editPostBodySchema = z.object({
  body: z
    .string()
    .max(500, "Post cannot exceed 500 characters.")
    .optional(),
});
