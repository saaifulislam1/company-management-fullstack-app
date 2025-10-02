import { z } from 'zod';

// Corrected Zod schema for login request body
export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});
