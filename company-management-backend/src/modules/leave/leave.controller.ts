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

export const getAllRequestsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const requests = await leaveService.getAllLeaveRequests();
    res
      .status(200)
      .json(new ApiResponse(200, requests, 'All leave requests fetched'));
  },
);

export const updateStatusController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { leaveId } = req.params;
    const { status } = req.body;
    const updatedRequest = await leaveService.updateLeaveStatus(
      leaveId,
      status,
    );
    res
      .status(200)
      .json(new ApiResponse(200, updatedRequest, 'Leave status updated'));
  },
);

export const getTeamRequestsController = asyncHandler(
  // 2. Use AuthRequest to type the 'req' parameter
  async (req: AuthRequest, res: Response) => {
    const managerId = req.employee!.id; // <-- This will now work without error
    const requests = await leaveService.getTeamLeaveRequests(managerId);
    res
      .status(200)
      .json(new ApiResponse(200, requests, 'Team leave requests fetched.'));
  },
);

export const managerUpdateStatusController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // 1. Get the manager's ID from the authenticated request.
    const managerId = req.employee!.id;
    // 2. Get the leaveId from the URL parameters.
    const { leaveId } = req.params;
    // 3. Get the new status from the request body.
    const { status } = req.body;

    // 4. Call the service with ALL THREE arguments.
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
