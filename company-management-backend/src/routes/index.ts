import { Leave } from '@prisma/client';
import { Router } from 'express';
import authRouter from '@/modules/auth/routes/auth.routes';
import employeeRouter from '@/modules/employee/routes/employee.routes';
import attendanceRouter from '@/modules/attendance/routes/attendance.routes';
import leaveRouter from '@/modules/leave/routes/leave.routes';

const mainRouter = Router();

// All routes for the auth module will be prefixed with '/auth'
// e.g., /api/v1/auth/login
mainRouter.use('/auth', authRouter);
mainRouter.use('/employees', employeeRouter);
mainRouter.use('/attendance', attendanceRouter);
mainRouter.use('/leave', leaveRouter);

export default mainRouter;
