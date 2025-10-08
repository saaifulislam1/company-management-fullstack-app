import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { Leave, LeaveStatus, Prisma } from '@prisma/client';
import { differenceInBusinessDays } from 'date-fns';
import { uploadOnCloudinary } from '@/utils/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export const applyForLeave = async (
  employeeId: string,
  data: any,
  attachment?: Express.Multer.File,
) => {
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
  let attachmentUrl: string | undefined = undefined;

  if (attachment) {
    // Generate a unique file name
    const fileName = `leave_${employeeId}_${uuidv4()}`;
    const result: any = await uploadOnCloudinary(attachment.buffer, fileName);
    attachmentUrl = result.secure_url;
  }

  // 4. Create the leave request (status is PENDING by default)
  return prisma.leave.create({
    data: {
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      employeeId: employee.id,
      approvedById: employee.managerId,
      managerStatus: 'PENDING',
      adminStatus: null,
      attachmentUrl: attachmentUrl,
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
// export const updateLeaveStatus = async (
//   leaveId: string,
//   status: LeaveStatus,
// ) => {
//   const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
//   if (!leave) {
//     throw new ApiError(404, 'Leave request not found');
//   }
//   return prisma.leave.update({
//     where: { id: leaveId },
//     data: { status },
//   });
// };

export const getTeamLeaveRequests = async (managerId: string) => {
  return prisma.leave.findMany({
    where: { employee: { managerId: managerId } }, // No longer filtering by PENDING
    include: { employee: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

// Manager approves/rejects a request
export const managerUpdateLeaveStatus = async (
  leaveId: string,
  managerId: string,
  status: LeaveStatus,
) => {
  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: {
      employee: true, // <-- This gets the most up-to-date employee info
    },
  });
  if (!leave || leave.employee.managerId !== managerId) {
    throw new ApiError(403, 'You are not authorized to update this request.');
  }
  return prisma.leave.update({
    where: { id: leaveId },
    data: { managerStatus: status },
  });
};
export const getAllLeaveRequests = async () => {
  return prisma.leave.findMany({
    where: { managerStatus: 'APPROVED' }, // Admins only see manager-approved requests
    include: { employee: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

// Admin's service: Updates the FINAL adminStatus and deducts leave
export const adminUpdateLeaveStatus = async (
  leaveId: string,
  status: LeaveStatus,
) => {
  const updatedLeave = await prisma.leave.update({
    where: { id: leaveId },
    data: { adminStatus: status },
  });

  // Deduct balance ONLY on final admin approval
  if (status === 'APPROVED') {
    const leaveDuration =
      differenceInBusinessDays(updatedLeave.endDate, updatedLeave.startDate) +
      1;
    const balanceField =
      updatedLeave.leaveType.toUpperCase() === 'VACATION'
        ? 'vacationBalance'
        : 'sickLeaveBalance';
    await prisma.profile.update({
      where: { employeeId: updatedLeave.employeeId },
      data: { [balanceField]: { decrement: leaveDuration } },
    });
  }

  return updatedLeave;
};
