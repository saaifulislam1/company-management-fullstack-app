import { Router } from 'express';
import { validate } from '@/middleware/validate';
import { loginSchema } from '../validators/auth.validator';
import { login } from '../controllers/auth.controller';

const router = Router();

// Define the POST route for /login
// 1. It first runs the 'validate' middleware with our 'loginSchema'.
// 2. If validation passes, it then calls the 'login' controller.
router.post('/login', validate(loginSchema), login);

export default router;
