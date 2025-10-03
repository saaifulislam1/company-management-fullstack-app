"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
// Corrected Zod schema for login request body
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.email({ message: 'Please enter a valid email address' }),
        password: zod_1.z
            .string()
            .min(6, { message: 'Password must be at least 6 characters long' }),
    }),
});
