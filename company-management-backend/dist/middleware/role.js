"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const apiError_1 = require("../utils/apiError");
/**
 * @middleware authorize
 * @description This is a higher-order function that creates a role-checking middleware.
 * It should be used AFTER the `protect` middleware.
 * @param {...UserRole[]} roles - An array of roles that are allowed to access the route.
 * @example router.post('/some-route', protect, authorize('ADMIN', 'HR'), someController);
 */
const authorize = (...roles) => {
    return (req, _res, next) => {
        // We can safely assume req.employee exists because this middleware runs after 'protect'.
        if (!req.employee || !roles.includes(req.employee.role)) {
            // If the employee's role is not in the list of allowed roles, deny access.
            throw new apiError_1.ApiError(403, // 403 Forbidden is more appropriate than 401 Unauthorized here.
            'You do not have permission to perform this action.');
        }
        // If the role matches, allow the request to proceed.
        next();
    };
};
exports.authorize = authorize;
