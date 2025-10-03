"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateLeaveStatus = exports.getAllLeaveRequests = exports.managerUpdateLeaveStatus = exports.getTeamLeaveRequests = exports.getLeaveHistory = exports.applyForLeave = void 0;
const client_1 = require("../../prisma/client");
const apiError_1 = require("../../utils/apiError");
const date_fns_1 = require("date-fns");
const applyForLeave = async (employeeId, data) => {
    const { startDate, endDate, leaveType } = data;
    // 1. Calculate the duration of the leave in business days
    const leaveDuration = (0, date_fns_1.differenceInBusinessDays)(new Date(endDate), new Date(startDate)) + 1;
    // 2. Fetch the employee's profile to check their balance and manager
    const employee = await client_1.prisma.employee.findUnique({
        where: { id: employeeId },
        include: { profile: true },
    });
    if (!employee?.profile) {
        throw new apiError_1.ApiError(404, 'Employee profile not found.');
    }
    // 3. Check if the balance is sufficient
    if (leaveType === 'VACATION' &&
        employee.profile.vacationBalance < leaveDuration) {
        throw new apiError_1.ApiError(400, `Insufficient vacation balance. You have ${employee.profile.vacationBalance} days remaining.`);
    }
    if (leaveType === 'SICK' &&
        employee.profile.sickLeaveBalance < leaveDuration) {
        throw new apiError_1.ApiError(400, `Insufficient sick leave balance. You have ${employee.profile.sickLeaveBalance} days remaining.`);
    }
    // 4. Create the leave request (status is PENDING by default)
    return client_1.prisma.leave.create({
        data: {
            leaveType: data.leaveType,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
            employeeId: employee.id,
            approvedById: employee.managerId,
            // --- THIS IS THE FIX ---
            // Explicitly set the initial status for the new workflow
            managerStatus: 'PENDING',
            adminStatus: null, // Admin status starts as null
            // --- END FIX ---
        },
    });
};
exports.applyForLeave = applyForLeave;
const getLeaveHistory = async (employeeId) => {
    return client_1.prisma.leave.findMany({
        where: { employeeId },
        orderBy: { startDate: 'desc' },
    });
};
exports.getLeaveHistory = getLeaveHistory;
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
const getTeamLeaveRequests = async (managerId) => {
    return client_1.prisma.leave.findMany({
        where: { employee: { managerId: managerId } }, // No longer filtering by PENDING
        include: { employee: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getTeamLeaveRequests = getTeamLeaveRequests;
// Manager approves/rejects a request
const managerUpdateLeaveStatus = async (leaveId, managerId, status) => {
    const leave = await client_1.prisma.leave.findUnique({
        where: { id: leaveId },
        include: {
            employee: true, // <-- This gets the most up-to-date employee info
        },
    });
    if (!leave || leave.employee.managerId !== managerId) {
        throw new apiError_1.ApiError(403, 'You are not authorized to update this request.');
    }
    return client_1.prisma.leave.update({
        where: { id: leaveId },
        data: { managerStatus: status },
    });
};
exports.managerUpdateLeaveStatus = managerUpdateLeaveStatus;
const getAllLeaveRequests = async () => {
    return client_1.prisma.leave.findMany({
        where: { managerStatus: 'APPROVED' }, // Admins only see manager-approved requests
        include: { employee: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getAllLeaveRequests = getAllLeaveRequests;
// Admin's service: Updates the FINAL adminStatus and deducts leave
const adminUpdateLeaveStatus = async (leaveId, status) => {
    const updatedLeave = await client_1.prisma.leave.update({
        where: { id: leaveId },
        data: { adminStatus: status },
    });
    // Deduct balance ONLY on final admin approval
    if (status === 'APPROVED') {
        const leaveDuration = (0, date_fns_1.differenceInBusinessDays)(updatedLeave.endDate, updatedLeave.startDate) +
            1;
        const balanceField = updatedLeave.leaveType.toUpperCase() === 'VACATION'
            ? 'vacationBalance'
            : 'sickLeaveBalance';
        await client_1.prisma.profile.update({
            where: { employeeId: updatedLeave.employeeId },
            data: { [balanceField]: { decrement: leaveDuration } },
        });
    }
    return updatedLeave;
};
exports.adminUpdateLeaveStatus = adminUpdateLeaveStatus;
