import { Router } from 'express';
import authRouter from '@/modules/auth/auth.routes';

const mainRouter = Router();

// All routes for the auth module will be prefixed with '/auth'
// e.g., /api/v1/auth/login
mainRouter.use('/auth', authRouter);

export default mainRouter;
