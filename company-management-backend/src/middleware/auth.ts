import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/apiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { verifyToken } from '@/utils/jwt';
import { prisma } from '@/prisma/client';
import { Employee } from '@prisma/client';

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

    // Check for the token in the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized. No token provided.');
    }

    // Verify the token using our utility function
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new ApiError(401, 'Not authorized. Token is invalid or expired.');
    }

    // Find the employee in the database using the ID from the token payload.
    // This ensures the user still exists.
    const currentEmployee = await prisma.employee.findUnique({
      where: { id: decoded.id },
    });

    if (!currentEmployee) {
      throw new ApiError(
        401,
        'The user belonging to this token no longer exists.',
      );
    }

    // Attach the employee object to the request
    req.employee = currentEmployee;

    // Grant access to the protected route
    next();
  },
);
