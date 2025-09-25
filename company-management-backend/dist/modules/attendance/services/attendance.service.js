"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceHistory = exports.checkOut = exports.checkIn = void 0;
const client_1 = require("@/prisma/client");
const apiError_1 = require("@/utils/apiError");
const date_fns_1 = require("date-fns");
/**
 * @async
 * @function checkIn
 * @description Marks the check-in time for an employee.
 * @param {string} employeeId - The ID of the employee checking in.
 */
const checkIn = async (employeeId) => {
    // Check if the employee has already checked in today and not checked out
    const today = new Date();
    const existingAttendance = await client_1.prisma.attendance.findFirst({
        where: {
            employeeId,
            checkIn: {
                gte: (0, date_fns_1.startOfDay)(today), // Greater than or equal to the start of today
                lte: (0, date_fns_1.endOfDay)(today), // Less than or equal to the end of today
            },
            checkOut: null,
        },
    });
    if (existingAttendance) {
        throw new apiError_1.ApiError(409, 'You have already checked in for today.');
    }
    return client_1.prisma.attendance.create({
        data: {
            employeeId,
            checkIn: new Date(),
        },
    });
};
exports.checkIn = checkIn;
/**
 * @async
 * @function checkOut
 * @description Marks the check-out time for an employee and calculates working hours.
 * @param {string} employeeId - The ID of the employee checking out.
 */
const checkOut = async (employeeId) => {
    // Find the latest attendance record for today that hasn't been checked out yet
    const attendanceToCheckOut = await client_1.prisma.attendance.findFirst({
        where: {
            employeeId,
            checkOut: null,
        },
        orderBy: {
            checkIn: 'desc',
        },
    });
    if (!attendanceToCheckOut) {
        throw new apiError_1.ApiError(404, 'No active check-in found to check out.');
    }
    // Calculate working hours
    const checkOutTime = new Date();
    const checkInTime = attendanceToCheckOut.checkIn;
    const durationInMs = checkOutTime.getTime() - checkInTime.getTime();
    const workingHours = durationInMs / (1000 * 60 * 60); // Convert milliseconds to hours
    return client_1.prisma.attendance.update({
        where: {
            id: attendanceToCheckOut.id,
        },
        data: {
            checkOut: checkOutTime,
            workingHours: parseFloat(workingHours.toFixed(2)), // Store with 2 decimal places
        },
    });
};
exports.checkOut = checkOut;
/**
 * @async
 * @function getAttendanceHistory
 * @description Retrieves the attendance history for a specific employee.
 * @param {string} employeeId - The ID of the employee.
 */
const getAttendanceHistory = async (employeeId) => {
    return client_1.prisma.attendance.findMany({
        where: { employeeId },
        orderBy: { checkIn: 'desc' },
    });
};
exports.getAttendanceHistory = getAttendanceHistory;
