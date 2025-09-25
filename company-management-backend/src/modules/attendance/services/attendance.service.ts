import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * @async
 * @function checkIn
 * @description Marks the check-in time for an employee.
 * @param {string} employeeId - The ID of the employee checking in.
 */
export const checkIn = async (employeeId: string) => {
  // Check if the employee has already checked in today and not checked out
  const today = new Date();
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      checkIn: {
        gte: startOfDay(today), // Greater than or equal to the start of today
        lte: endOfDay(today), // Less than or equal to the end of today
      },
      checkOut: null,
    },
  });

  if (existingAttendance) {
    throw new ApiError(409, 'You have already checked in for today.');
  }

  return prisma.attendance.create({
    data: {
      employeeId,
      checkIn: new Date(),
    },
  });
};

/**
 * @async
 * @function checkOut
 * @description Marks the check-out time for an employee and calculates working hours.
 * @param {string} employeeId - The ID of the employee checking out.
 */
export const checkOut = async (employeeId: string) => {
  // Find the latest attendance record for today that hasn't been checked out yet
  const attendanceToCheckOut = await prisma.attendance.findFirst({
    where: {
      employeeId,
      checkOut: null,
    },
    orderBy: {
      checkIn: 'desc',
    },
  });

  if (!attendanceToCheckOut) {
    throw new ApiError(404, 'No active check-in found to check out.');
  }

  // Calculate working hours
  const checkOutTime = new Date();
  const checkInTime = attendanceToCheckOut.checkIn;
  const durationInMs = checkOutTime.getTime() - checkInTime.getTime();
  const workingHours = durationInMs / (1000 * 60 * 60); // Convert milliseconds to hours

  return prisma.attendance.update({
    where: {
      id: attendanceToCheckOut.id,
    },
    data: {
      checkOut: checkOutTime,
      workingHours: parseFloat(workingHours.toFixed(2)), // Store with 2 decimal places
    },
  });
};

/**
 * @async
 * @function getAttendanceHistory
 * @description Retrieves the attendance history for a specific employee.
 * @param {string} employeeId - The ID of the employee.
 */
export const getAttendanceHistory = async (employeeId: string) => {
  return prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { checkIn: 'desc' },
  });
};
