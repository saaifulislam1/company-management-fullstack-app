/**
 * @class ApiResponse
 * @description A standardized wrapper for successful API responses.
 * This ensures that the frontend always receives data in a consistent format.
 */
class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    // A status code less than 400 indicates success.
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
