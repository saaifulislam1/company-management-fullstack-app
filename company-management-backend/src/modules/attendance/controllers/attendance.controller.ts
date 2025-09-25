import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middleware/auth';
import { ApiResponse } from '@/utils/apiResponse';
import {
  checkIn,
  checkOut,
  getAttendanceHistory,
} from '../services/attendance.service';

export const checkInController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const employeeId = req.employee!.id;
    const attendance = await checkIn(employeeId);
    res
      .status(201)
      .json(new ApiResponse(201, attendance, 'Checked in successfully'));
  },
);

export const checkOutController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const employeeId = req.employee!.id;
    const attendance = await checkOut(employeeId);
    res
      .status(200)
      .json(new ApiResponse(200, attendance, 'Checked out successfully'));
  },
);

export const getHistoryController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const employeeId = req.employee!.id;
    const history = await getAttendanceHistory(employeeId);
    res
      .status(200)
      .json(new ApiResponse(200, history, 'Attendance history fetched'));
  },
);
