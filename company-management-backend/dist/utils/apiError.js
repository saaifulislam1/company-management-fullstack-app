"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
//These classes will help us standardize our API responses.
/**
 * @class ApiError
 * @extends Error
 * @description A custom error class for handling API errors in a structured way.
 * This allows us to send consistent error responses with a specific status code.
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        // 'isOperational' helps distinguish between our predictable errors (e.g., "User not found")
        // and programming errors (e.g., a bug in the code).
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
