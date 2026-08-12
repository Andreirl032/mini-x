import { z } from "zod";
import countryCodes from "../../country_codes.json";
const validCodes = countryCodes.map((c) => c.sigla);

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(30, "Username cannot exceed 30 characters."),
  name: z.string().min(1, "Name is required."),
  email: z.email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  profilePicture: z.url("Profile picture must be a valid URL.").optional(),
  bio: z.string().max(160, "Bio cannot exceed 160 characters.").optional(),
  birthDate: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.enum(validCodes as [string, ...string[]]).optional(),
});

export const editUserSchema = createUserSchema
  .pick({
    username: true,
    name: true,
    profilePicture: true,
    bio: true,
    city: true,
    countryCode: true,
  })
  .partial();