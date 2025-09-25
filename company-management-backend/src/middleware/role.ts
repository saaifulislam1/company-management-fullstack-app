import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ApiError } from '@/utils/apiError';
import { AuthRequest } from './auth'; // Import our custom request type

/**
 * @middleware authorize
 * @description This is a higher-order function that creates a role-checking middleware.
 * It should be used AFTER the `protect` middleware.
 * @param {...UserRole[]} roles - An array of roles that are allowed to access the route.
 * @example router.post('/some-route', protect, authorize('ADMIN', 'HR'), someController);
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    // We can safely assume req.employee exists because this middleware runs after 'protect'.
    if (!req.employee || !roles.includes(req.employee.role)) {
      // If the employee's role is not in the list of allowed roles, deny access.
      throw new ApiError(
        403, // 403 Forbidden is more appropriate than 401 Unauthorized here.
        'You do not have permission to perform this action.',
      );
    }
    // If the role matches, allow the request to proceed.
    next();
  };
};
