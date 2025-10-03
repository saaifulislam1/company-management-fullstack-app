"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const employee_routes_1 = __importDefault(require("../modules/employee/employee.routes"));
const attendance_routes_1 = __importDefault(require("../modules/attendance/attendance.routes"));
const leave_routes_1 = __importDefault(require("../modules/leave/leave.routes"));
const mainRouter = (0, express_1.Router)();
// All routes for the auth module will be prefixed with '/auth'
// e.g., /api/v1/auth/login
mainRouter.use('/auth', auth_routes_1.default);
mainRouter.use('/employees', employee_routes_1.default);
mainRouter.use('/attendance', attendance_routes_1.default);
mainRouter.use('/leave', leave_routes_1.default);
exports.default = mainRouter;
