import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/apiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { verifyToken } from '@/utils/jwt';
import { prisma } from '@/prisma/client';
import { Employee } from '@prisma/client';
import { redis } from '@/config/redis';

// We extend the default Express Request type to include our 'employee' property.
// This gives us type safety and autocompletion in our controllers.
export interface AuthRequest extends Request {
  employee?: Employee;
}

/**
 * @middleware protect
 * @description This middleware performs authentication.
 * 1. It expects a JWT in the 'Authorization' header (e.g., "Bearer <token>").
 * 2. It verifies the token.
 * 3. If valid, it fetches the corresponding employee from the database.
 * 4. It attaches the employee object to the request (`req.employee`) for later use.
 */
export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token;

    // 1. Extract the token from the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized. No token provided.');
    }

    // 2. Verify the JWT and get the decoded payload
    const decoded = verifyToken(token);
    if (!decoded || !decoded.sessionId) {
      throw new ApiError(401, 'Not authorized, token is invalid.');
    }

    // --- THIS IS THE NEW LOGIC ---
    // 3. Look up the session in Redis using the sessionId from the token
    const sessionData = await redis.get(`session:${decoded.sessionId}`);

    // 4. If the session does not exist in Redis, the user is not authenticated
    if (!sessionData) {
      throw new ApiError(
        401,
        'Session expired or invalid. Please log in again.',
      );
    }

    // 5. Parse the user data from the session and attach it to the request
    const employee = JSON.parse(sessionData);
    req.employee = employee;

    next();
    // --- END NEW LOGIC ---
  },
);
