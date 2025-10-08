import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/apiResponse';
import { loginEmployee, logoutEmployee } from './auth.service';
import { AuthRequest } from '@/middleware/auth';
import { verifyToken } from '@/utils/jwt';

/**
 * @controller login
 * @description Handles the employee login request.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Extract email and password from the validated request body
  const { email, password } = req.body;

  // Call the service function to perform the login logic
  const { employee, token } = await loginEmployee(email, password);

  // Send a successful response back to the client
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { employee, token },
        'Employee logged in successfully',
      ),
    );
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token ? verifyToken(token) : null;

  if (decoded?.sessionId) {
    await logoutEmployee(decoded.sessionId);
  }

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});
