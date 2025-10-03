"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = exports.register = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const apiResponse_1 = require("../../../utils/apiResponse");
const employee_service_1 = require("../services/employee.service");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const newEmployee = await (0, employee_service_1.registerEmployee)(req.body);
    res
        .status(201)
        .json(new apiResponse_1.ApiResponse(201, newEmployee, 'Employee registered successfully'));
});
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // The employee ID is retrieved from the `req.employee` object attached by the `protect` middleware
    const employeeId = req.employee.id;
    const employeeProfile = await (0, employee_service_1.getEmployeeProfile)(employeeId);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, employeeProfile, 'Profile fetched successfully'));
});
exports.updateMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const employeeId = req.employee.id;
    const updatedProfile = await (0, employee_service_1.updateEmployeeProfile)(employeeId, req.body);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, updatedProfile, 'Profile updated successfully'));
});
