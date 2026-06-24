import { z } from "zod";
import { CATEGORIES } from "@/types";

export { CATEGORIES };

export const itemSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Please describe the item in more detail").max(1000, "Description too long"),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  location: z.string().min(5, "Location must be at least 5 characters").max(100),
  date_occurred: z.string().refine((d) => new Date(d) <= new Date(), {
    message: "Date cannot be in the future",
  }),
  contact_info: z.string().min(5, "Contact info is required").max(200),
  storage_location: z.string().max(200).optional(),
});

export const aiDescriptionSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().min(3).max(100),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  location: z.string().min(3).max(100),
});

export const updateStatusSchema = z.object({
  status: z.enum(["open", "claimed", "removed"]),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
export type AiDescriptionValues = z.infer<typeof aiDescriptionSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
