import { z } from "zod";

export const composePostSchema = z.object({
  body: z
    .string()
    .max(500, "Post cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
});

export type ComposePostValues = z.infer<typeof composePostSchema>;
