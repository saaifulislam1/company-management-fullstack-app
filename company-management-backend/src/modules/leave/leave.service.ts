import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { Leave, LeaveStatus, Prisma } from '@prisma/client';
import { differenceInBusinessDays } from 'date-fns';

export const applyForLeave = async (employeeId: string, data: any) => {
  const { startDate, endDate, leaveType } = data;

  // 1. Calculate the duration of the leave in business days
  const leaveDuration =
    differenceInBusinessDays(new Date(endDate), new Date(startDate)) + 1;

  // 2. Fetch the employee's profile to check their balance and manager
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { profile: true },
  });

  if (!employee?.profile) {
    throw new ApiError(404, 'Employee profile not found.');
  }

  // 3. Check if the balance is sufficient
  if (
    leaveType === 'VACATION' &&
    employee.profile.vacationBalance < leaveDuration
  ) {
    throw new ApiError(
      400,
      `Insufficient vacation balance. You have ${employee.profile.vacationBalance} days remaining.`,
    );
  }
  if (
    leaveType === 'SICK' &&
    employee.profile.sickLeaveBalance < leaveDuration
  ) {
    throw new ApiError(
      400,
      `Insufficient sick leave balance. You have ${employee.profile.sickLeaveBalance} days remaining.`,
    );
  }

  // 4. Create the leave request (status is PENDING by default)
  return prisma.leave.create({
    data: {
      ...data,
      employeeId: employee.id,
      // Assign it to the employee's manager for approval
      approvedById: employee.managerId,
    },
  });
};
export const getLeaveHistory = async (employeeId: string) => {
  return prisma.leave.findMany({
    where: { employeeId },
    orderBy: { startDate: 'desc' },
  });
};

// Admin/HR function
export const getAllLeaveRequests = async () => {
  return prisma.leave.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      employee: {
        include: {
          profile: true,
        },
      },
    },
  });
};

// Admin/HR function
export const updateLeaveStatus = async (
  leaveId: string,
  status: LeaveStatus,
) => {
  const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
  if (!leave) {
    throw new ApiError(404, 'Leave request not found');
  }
  return prisma.leave.update({
    where: { id: leaveId },
    data: { status },
  });
};

export const getTeamLeaveRequests = async (managerId: string) => {
  return prisma.leave.findMany({
    where: {
      employee: {
        managerId: managerId,
      },
      status: 'PENDING',
    },
    include: {
      employee: { include: { profile: true } },
    },
  });
};

// Manager approves/rejects a request
export const managerUpdateLeaveStatus = async (
  leaveId: string,
  managerId: string,
  status: 'APPROVED' | 'REJECTED',
) => {
  const leave = await prisma.leave.findUnique({ where: { id: leaveId } });

  // Security check: ensure the leave request belongs to the manager's subordinate
  if (!leave || leave.approvedById !== managerId) {
    throw new ApiError(403, 'You are not authorized to update this request.');
  }

  const updatedLeave = await prisma.leave.update({
    where: { id: leaveId },
    data: { status },
  });

  // If approved, deduct from the balance
  if (status === 'APPROVED') {
    const leaveDuration =
      differenceInBusinessDays(updatedLeave.endDate, updatedLeave.startDate) +
      1;
    const balanceField =
      updatedLeave.leaveType === 'VACATION'
        ? 'vacationBalance'
        : 'sickLeaveBalance';

    await prisma.profile.update({
      where: { employeeId: updatedLeave.employeeId },
      data: {
        [balanceField]: {
          decrement: leaveDuration,
        },
      },
    });
  }

  return updatedLeave;
};
