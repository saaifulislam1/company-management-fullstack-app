"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryController = exports.checkOutController = exports.checkInController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const attendance_service_1 = require("./attendance.service");
exports.checkInController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const employeeId = req.employee.id;
    const attendance = await (0, attendance_service_1.checkIn)(employeeId);
    res
        .status(201)
        .json(new apiResponse_1.ApiResponse(201, attendance, 'Checked in successfully'));
});
exports.checkOutController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const employeeId = req.employee.id;
    const attendance = await (0, attendance_service_1.checkOut)(employeeId);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, attendance, 'Checked out successfully'));
});
exports.getHistoryController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const employeeId = req.employee.id;
    const history = await (0, attendance_service_1.getAttendanceHistory)(employeeId);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, history, 'Attendance history fetched'));
});
