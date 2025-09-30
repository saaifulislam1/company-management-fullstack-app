import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middleware/auth';
import { ApiResponse } from '@/utils/apiResponse';
import * as leaveService from './leave.service';

export const applyLeaveController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const leave = await leaveService.applyForLeave(req.employee!.id, req.body);
    res
      .status(201)
      .json(new ApiResponse(201, leave, 'Leave request submitted'));
  },
);

export const getHistoryController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const history = await leaveService.getLeaveHistory(req.employee!.id);
    res
      .status(200)
      .json(new ApiResponse(200, history, 'Leave history fetched'));
  },
);

// For Admins to get requests approved by managers
export const getAllRequestsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const requests = await leaveService.getAllLeaveRequests();
    res
      .status(200)
      .json(new ApiResponse(200, requests, 'All leave requests fetched'));
  },
);

// For Managers to get requests from their team
export const getTeamRequestsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const managerId = req.employee!.id;
    const requests = await leaveService.getTeamLeaveRequests(managerId);
    res
      .status(200)
      .json(new ApiResponse(200, requests, 'Team leave requests fetched.'));
  },
);

// For Managers to update their team's requests
export const managerUpdateStatusController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const managerId = req.employee!.id;
    const { leaveId } = req.params;
    const { status } = req.body;
    const updatedRequest = await leaveService.managerUpdateLeaveStatus(
      leaveId,
      managerId,
      status,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedRequest, 'Leave status updated by manager'),
      );
  },
);

// For Admins to make the final update
export const adminUpdateStatusController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { leaveId } = req.params;
    const { status } = req.body;
    const updatedRequest = await leaveService.adminUpdateLeaveStatus(
      leaveId,
      status,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedRequest, 'Leave status updated by admin'),
      );
  },
);
