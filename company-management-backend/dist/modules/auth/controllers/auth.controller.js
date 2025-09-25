"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const asyncHandler_1 = require("@/utils/asyncHandler");
const apiResponse_1 = require("@/utils/apiResponse");
const auth_service_1 = require("../services/auth.service");
/**
 * @controller login
 * @description Handles the employee login request.
 */
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Extract email and password from the validated request body
    const { email, password } = req.body;
    // Call the service function to perform the login logic
    const { employee, token } = await (0, auth_service_1.loginEmployee)(email, password);
    // Send a successful response back to the client
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, { employee, token }, 'Employee logged in successfully'));
});
