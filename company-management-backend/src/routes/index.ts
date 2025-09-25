import { Router } from 'express';
import authRouter from '@/modules/auth/routes/auth.routes';
import employeeRouter from '@/modules/employee/routes/employee.routes';

const mainRouter = Router();

// All routes for the auth module will be prefixed with '/auth'
// e.g., /api/v1/auth/login
mainRouter.use('/auth', authRouter);
mainRouter.use('/employees', employeeRouter);

export default mainRouter;
