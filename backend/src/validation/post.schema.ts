import { z } from "zod";

export const postSchema = z.object({
  body: z
    .string()
    .max(500, "Post cannot exceed 500 characters.")
    .optional(),
  image: z
    .url("Image must be a valid URL.")
    .optional(),
  parentId: z
  .cuid2("Invalid parent ID format.")
    .optional(),
}).refine((data) => data.body || data.image, {
  message: "A post must contain either text or an image.",
  path: ["body"], 
});

export const editPostSchema = z.object({
  body: z
    .string()
    .max(500, "Post cannot exceed 500 characters.")
    .optional(),
  image: z
    .url("Image must be a valid URL.")
    .optional(),
}).refine((data) => data.body || data.image, {
  message: "A post must contain either text or an image.",
  path: ["body"],
});