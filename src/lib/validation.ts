import { z } from "zod";

// Authentication validation schemas
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
});

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  firstName: z
    .string()
    .trim()
    .max(100, { message: "First name must be less than 100 characters" })
    .optional(),
  lastName: z
    .string()
    .trim()
    .max(100, { message: "Last name must be less than 100 characters" })
    .optional(),
});

// Content validation schemas
export const contentInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Content cannot be empty" })
    .max(50000, { message: "Content must be less than 50,000 characters" }),
  platforms: z
    .array(z.string())
    .min(1, { message: "Please select at least one platform" })
    .max(10, { message: "Maximum 10 platforms allowed" }),
  tone: z
    .string()
    .max(50, { message: "Tone must be less than 50 characters" })
    .optional(),
  style: z
    .string()
    .max(50, { message: "Style must be less than 50 characters" })
    .optional(),
});

// URL validation schema
export const urlSchema = z.object({
  url: z
    .string()
    .trim()
    .url({ message: "Please enter a valid URL" })
    .max(2000, { message: "URL must be less than 2000 characters" }),
});

// Keyword validation schema
export const keywordSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(1, { message: "Keyword cannot be empty" })
    .max(200, { message: "Keyword must be less than 200 characters" }),
});

// Project validation schema
export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name cannot be empty" })
    .max(100, { message: "Project name must be less than 100 characters" }),
  domain: z
    .string()
    .trim()
    .url({ message: "Please enter a valid domain URL" })
    .max(255, { message: "Domain must be less than 255 characters" }),
  targetLocation: z
    .string()
    .trim()
    .max(100, { message: "Target location must be less than 100 characters" })
    .optional(),
  targetLanguage: z
    .string()
    .trim()
    .length(2, { message: "Language code must be 2 characters" })
    .optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ContentInput = z.infer<typeof contentInputSchema>;
export type UrlInput = z.infer<typeof urlSchema>;
export type KeywordInput = z.infer<typeof keywordSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
