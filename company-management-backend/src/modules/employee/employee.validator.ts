import { z } from 'zod';
import { UserRole, Department } from '@prisma/client';

export const registerEmployeeSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(UserRole).optional(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfJoining: z.string().transform((str) => new Date(str)),
    department: z.nativeEnum(Department).optional(), // <-- Add department validation
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    // The fields to validate must be inside this 'body' object
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(), // <-- Add this line
  }),
});
