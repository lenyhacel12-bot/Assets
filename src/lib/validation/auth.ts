import { z } from "zod";
import { ROLES } from "@/lib/auth/permissions";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const inviteUserSchema = z.object({
  email: z.string().email("Enter a valid email"),
  fullName: z.string().min(1, "Full name is required").max(120),
  roleCode: z.enum(ROLES),
  branchIds: z.array(z.string().uuid()).default([]),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  preferredLanguage: z.enum(["en", "tl"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
