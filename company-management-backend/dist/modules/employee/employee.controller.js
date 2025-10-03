"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeProfileController = exports.getPotentialManagersController = exports.getEmployeeAttendanceAnalyticsController = exports.getFullEmployeeDetailsController = exports.getEmployeeAnalyticsController = exports.getEmployeeByIdController = exports.getAllEmployees = exports.updateMe = exports.getMe = exports.register = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const employee_service_1 = require("./employee.service");
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
    const updateData = req.body;
    const updatedProfile = await (0, employee_service_1.updateEmployeeProfile)(employeeId, updateData);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, updatedProfile, 'Profile updated successfully'));
});
exports.getAllEmployees = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const employees = await (0, employee_service_1.findAllEmployees)();
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, employees, 'All employees fetched successfully'));
});
exports.getEmployeeByIdController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Get the employee ID from the URL parameters (e.g., /employees/abc-123)
    const { id } = req.params;
    // Call the service to find the employee
    const employee = await (0, employee_service_1.findEmployeeById)(id);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, employee, 'Employee profile fetched successfully'));
});
exports.getEmployeeAnalyticsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const analytics = await (0, employee_service_1.getEmployeeAnalytics)(id);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, analytics, 'Employee analytics fetched successfully'));
});
exports.getFullEmployeeDetailsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const details = await (0, employee_service_1.getFullEmployeeDetails)(id);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, details, 'Full employee details fetched'));
});
exports.getEmployeeAttendanceAnalyticsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const analytics = await (0, employee_service_1.getEmployeeAttendanceAnalytics)(id);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, analytics, 'Attendance analytics fetched'));
});
exports.getPotentialManagersController = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const managers = await (0, employee_service_1.findPotentialManagers)();
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, managers, 'Potential managers fetched'));
});
exports.updateEmployeeProfileController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedEmployee = await (0, employee_service_1.updateEmployeeProfile)(id, updateData);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, updatedEmployee, 'Employee profile updated'));
});
