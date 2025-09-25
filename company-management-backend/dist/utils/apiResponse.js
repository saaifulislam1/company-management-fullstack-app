"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
/**
 * @class ApiResponse
 * @description A standardized wrapper for successful API responses.
 * This ensures that the frontend always receives data in a consistent format.
 */
class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        // A status code less than 400 indicates success.
        this.success = statusCode < 400;
    }
}
exports.ApiResponse = ApiResponse;
