import { z } from "zod";

// Your existing schemas (keep as is)
export const UserSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username must be less than 50 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password must be less than 20 characters" })
    .refine(
      (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password),
      { message: "Password must include uppercase, lowercase, and number" }
    ),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username must be less than 50 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password must be less than 20 characters" })
    .refine(
      (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password),
      { message: "Password must include uppercase, lowercase, and number" }
    ),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required minimum 6 characters"),
});

// Optional: Additional schemas for email verification
export const EmailVerificationSchema = z.object({
  token: z.string().uuid({ message: "Invalid verification token" }),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// Optional: Schema for password reset (if you plan to add this feature)
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().uuid({ message: "Invalid reset token" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password must be less than 20 characters" })
    .refine(
      (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password),
      { message: "Password must include uppercase, lowercase, and number" }
    ),
});