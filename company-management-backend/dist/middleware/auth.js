"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const jwt_1 = require("../utils/jwt");
const client_1 = require("../prisma/client");
/**
 * @middleware protect
 * @description This middleware performs authentication.
 * 1. It expects a JWT in the 'Authorization' header (e.g., "Bearer <token>").
 * 2. It verifies the token.
 * 3. If valid, it fetches the corresponding employee from the database.
 * 4. It attaches the employee object to the request (`req.employee`) for later use.
 */
exports.protect = (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    let token;
    // Check for the token in the Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        throw new apiError_1.ApiError(401, 'Not authorized. No token provided.');
    }
    // Verify the token using our utility function
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        throw new apiError_1.ApiError(401, 'Not authorized. Token is invalid or expired.');
    }
    // Find the employee in the database using the ID from the token payload.
    // This ensures the user still exists.
    const currentEmployee = await client_1.prisma.employee.findUnique({
        where: { id: decoded.id },
    });
    if (!currentEmployee) {
        throw new apiError_1.ApiError(401, 'The user belonging to this token no longer exists.');
    }
    // Attach the employee object to the request
    req.employee = currentEmployee;
    // Grant access to the protected route
    next();
});
