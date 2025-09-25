"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaveStatusSchema = exports.applyLeaveSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.applyLeaveSchema = zod_1.z
    .object({
    body: zod_1.z.object({
        leaveType: zod_1.z.string().min(1, 'Leave type is required'),
        startDate: zod_1.z.string().transform((str) => new Date(str)),
        endDate: zod_1.z.string().transform((str) => new Date(str)),
        reason: zod_1.z.string().min(1, 'Reason for leave is required'),
    }),
})
    .refine((data) => data.body.endDate >= data.body.startDate, {
    message: 'End date cannot be before start date',
    path: ['body', 'endDate'],
});
exports.updateLeaveStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z
            .enum(Object.values(client_1.LeaveStatus))
            .refine((val) => Object.values(client_1.LeaveStatus).includes(val), {
            message: 'Invalid leave status',
        }),
    }),
});
