"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiError_1 = require("../utils/apiError");
/**
 * @function errorHandler
 * @description The global error handling middleware for the application.
 * It catches all errors passed via `next(error)` and sends a
 * standardized JSON response.
 */
const errorHandler = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    // Default to 500 if status code is not set
    let statusCode = 500;
    let message = 'Internal Server Error';
    // Check if the error is a known, operational error from our ApiError class
    if (err instanceof apiError_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else {
        // For unexpected errors, log them for debugging purposes
        console.error('UNEXPECTED ERROR 💥:', err);
    }
    // Send the formatted error response
    res.status(statusCode).json({
        success: false,
        message: message,
        // Include stack trace only in development environment for easier debugging
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
