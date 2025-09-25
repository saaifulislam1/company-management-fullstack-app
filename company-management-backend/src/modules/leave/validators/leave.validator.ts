import { z } from 'zod';
import { LeaveStatus } from '@prisma/client';

export const applyLeaveSchema = z
  .object({
    body: z.object({
      leaveType: z.string().min(1, 'Leave type is required'),
      startDate: z.string().transform((str) => new Date(str)),
      endDate: z.string().transform((str) => new Date(str)),
      reason: z.string().min(1, 'Reason for leave is required'),
    }),
  })
  .refine((data) => data.body.endDate >= data.body.startDate, {
    message: 'End date cannot be before start date',
    path: ['body', 'endDate'],
  });

export const updateLeaveStatusSchema = z.object({
  body: z.object({
    status: z
      .enum(Object.values(LeaveStatus) as [string, ...string[]])
      .refine(
        (val) => Object.values(LeaveStatus).includes(val as LeaveStatus),
        {
          message: 'Invalid leave status',
        },
      ),
  }),
});
