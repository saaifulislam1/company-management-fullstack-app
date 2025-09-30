import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { Leave, LeaveStatus, Prisma } from '@prisma/client';

export const applyForLeave = async (
  employeeId: string,
  data: Omit<Leave, 'id' | 'employeeId' | 'status' | 'createdAt' | 'updatedAt'>,
) => {
  return prisma.leave.create({
    data: {
      ...data,
      employeeId,
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
