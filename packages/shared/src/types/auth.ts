import { z } from "zod";

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Response types
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    level: number;
    xp: number;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
}
