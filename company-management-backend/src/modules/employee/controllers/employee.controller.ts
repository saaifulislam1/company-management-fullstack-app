import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middleware/auth';
import { ApiResponse } from '@/utils/apiResponse';
import {
  registerEmployee,
  getEmployeeProfile,
  updateEmployeeProfile,
} from '../services/employee.service';

export const register = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const newEmployee = await registerEmployee(req.body);
    res
      .status(201)
      .json(
        new ApiResponse(201, newEmployee, 'Employee registered successfully'),
      );
  },
);

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  // The employee ID is retrieved from the `req.employee` object attached by the `protect` middleware
  const employeeId = req.employee!.id;
  const employeeProfile = await getEmployeeProfile(employeeId);
  res
    .status(200)
    .json(
      new ApiResponse(200, employeeProfile, 'Profile fetched successfully'),
    );
});

export const updateMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const employeeId = req.employee!.id;
    const updatedProfile = await updateEmployeeProfile(employeeId, req.body);
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedProfile, 'Profile updated successfully'),
      );
  },
);
