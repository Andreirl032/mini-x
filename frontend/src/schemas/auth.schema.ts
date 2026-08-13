import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username cannot exceed 30 characters."),
    name: z.string().min(1, "Name is required."),
    email: z.email("Invalid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    bio: z.string().max(160, "Bio cannot exceed 160 characters.").optional(),
    city: z.string().optional(),
    countryCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username cannot exceed 30 characters."),
  name: z.string().min(1, "Name is required."),
  bio: z.string().max(160, "Bio cannot exceed 160 characters.").optional(),
  city: z.string().optional(),
  countryCode: z.string().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type EditProfileValues = z.infer<typeof editProfileSchema>;
