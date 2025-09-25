"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginEmployee = void 0;
const client_1 = require("@/prisma/client");
const apiError_1 = require("@/utils/apiError");
const password_1 = require("@/utils/password");
const jwt_1 = require("@/utils/jwt");
/**
 * @async
 * @function loginEmployee
 * @description Service function to handle employee login.
 * @param {string} email - The employee's email.
 * @param {string} password - The employee's plain-text password.
 * @returns {Promise<object>} An object containing the logged-in employee (without password) and the JWT.
 */
const loginEmployee = async (email, password) => {
    // 1. Find the employee by email
    const employee = await client_1.prisma.employee.findUnique({
        where: { email },
    });
    // 2. If no employee is found, or if the password doesn't match, throw an error
    if (!employee || !(await (0, password_1.comparePassword)(password, employee.password))) {
        throw new apiError_1.ApiError(401, 'Invalid email or password');
    }
    // 3. Generate a JWT for the authenticated employee
    const token = (0, jwt_1.generateToken)(employee.id, employee.role);
    // 4. Remove the password from the employee object before returning it
    const { password: _, ...employeeWithoutPassword } = employee;
    return { employee: employeeWithoutPassword, token };
};
exports.loginEmployee = loginEmployee;
