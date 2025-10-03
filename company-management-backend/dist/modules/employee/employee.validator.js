"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateEmployeeSchema = exports.updateProfileSchema = exports.registerEmployeeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('A valid email is required'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        role: zod_1.z.enum(client_1.UserRole).optional(),
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        dateOfJoining: zod_1.z.string().transform((str) => new Date(str)),
        department: zod_1.z.nativeEnum(client_1.Department).optional(), // <-- Add department validation
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        // The fields to validate must be inside this 'body' object
        firstName: zod_1.z.string().min(1, 'First name is required').optional(),
        lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.string().optional(), // <-- Add this line
        managerId: zod_1.z.string().optional(),
    }),
});
exports.adminUpdateEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        // Employee model fields
        email: zod_1.z.string().email().optional(),
        role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
        managerId: zod_1.z.string().nullable().optional(), // Can be set to null
        // Profile model fields
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.string().optional(),
        department: zod_1.z.nativeEnum(client_1.Department).optional(),
        vacationBalance: zod_1.z.number().min(0).optional(),
        sickLeaveBalance: zod_1.z.number().min(0).optional(),
    }),
});
