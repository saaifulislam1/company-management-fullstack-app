import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middleware/auth';
import { ApiResponse } from '@/utils/apiResponse';
import {
  registerEmployee,
  getEmployeeProfile,
  updateEmployeeProfile,
  findAllEmployees,
  findEmployeeById,
  getEmployeeAnalytics,
  getFullEmployeeDetails,
  getEmployeeAttendanceAnalytics,
} from './employee.service';

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
    const updateData = req.body;
    const updatedProfile = await updateEmployeeProfile(employeeId, updateData);
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedProfile, 'Profile updated successfully'),
      );
  },
);

export const getAllEmployees = asyncHandler(async (_req, res) => {
  const employees = await findAllEmployees();
  res
    .status(200)
    .json(
      new ApiResponse(200, employees, 'All employees fetched successfully'),
    );
});
export const getEmployeeByIdController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Get the employee ID from the URL parameters (e.g., /employees/abc-123)
    const { id } = req.params;

    // Call the service to find the employee
    const employee = await findEmployeeById(id);

    res
      .status(200)
      .json(
        new ApiResponse(200, employee, 'Employee profile fetched successfully'),
      );
  },
);

export const getEmployeeAnalyticsController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const analytics = await getEmployeeAnalytics(id);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        'Employee analytics fetched successfully',
      ),
    );
});

export const getFullEmployeeDetailsController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const details = await getFullEmployeeDetails(id);
    res
      .status(200)
      .json(new ApiResponse(200, details, 'Full employee details fetched'));
  },
);

export const getEmployeeAttendanceAnalyticsController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const analytics = await getEmployeeAttendanceAnalytics(id);
    res
      .status(200)
      .json(new ApiResponse(200, analytics, 'Attendance analytics fetched'));
  },
);
