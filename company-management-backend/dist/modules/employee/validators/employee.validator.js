"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.registerEmployeeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('A valid email is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.nativeEnum(client_1.UserRole).optional(), // Optional, defaults to EMPLOYEE
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        dateOfJoining: zod_1.z.string().transform((str) => new Date(str)), // Convert string to Date
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required').optional(),
        lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.string().optional(),
    }),
});
