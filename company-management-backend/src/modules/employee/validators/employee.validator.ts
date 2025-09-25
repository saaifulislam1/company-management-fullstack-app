import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerEmployeeSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(UserRole).optional(), // Optional, defaults to EMPLOYEE
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfJoining: z.string().transform((str) => new Date(str)), // Convert string to Date
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    // The fields to validate must be inside this 'body' object
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});
