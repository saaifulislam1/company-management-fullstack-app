"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaveStatus = exports.getAllLeaveRequests = exports.getLeaveHistory = exports.applyForLeave = void 0;
const client_1 = require("../../../prisma/client");
const apiError_1 = require("../../../utils/apiError");
const applyForLeave = async (employeeId, data) => {
    return client_1.prisma.leave.create({
        data: {
            ...data,
            employeeId,
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
const getAllLeaveRequests = async () => {
    return client_1.prisma.leave.findMany({
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
exports.getAllLeaveRequests = getAllLeaveRequests;
// Admin/HR function
const updateLeaveStatus = async (leaveId, status) => {
    const leave = await client_1.prisma.leave.findUnique({ where: { id: leaveId } });
    if (!leave) {
        throw new apiError_1.ApiError(404, 'Leave request not found');
    }
    return client_1.prisma.leave.update({
        where: { id: leaveId },
        data: { status },
    });
};
exports.updateLeaveStatus = updateLeaveStatus;
