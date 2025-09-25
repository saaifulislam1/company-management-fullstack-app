"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeProfile = exports.getEmployeeProfile = exports.registerEmployee = void 0;
const client_1 = require("@/prisma/client");
const apiError_1 = require("@/utils/apiError");
const password_1 = require("@/utils/password");
/**
 * @async
 * @function registerEmployee
 * @description Creates a new employee and their profile in a single transaction.
 * @param {Prisma.EmployeeCreateInput & { profile: Omit<Profile, 'id' | 'employeeId'> }} data
 * @returns {Promise<object>} The newly created employee object without the password.
 */
const registerEmployee = async (data) => {
    // 1. Check if an employee with this email already exists
    const existingEmployee = await client_1.prisma.employee.findUnique({
        where: { email: data.email },
    });
    if (existingEmployee) {
        throw new apiError_1.ApiError(409, 'An employee with this email already exists.');
    }
    // 2. Hash the password
    const hashedPassword = await (0, password_1.hashPassword)(data.password);
    // 3. Use a Prisma transaction to ensure both records are created or neither is.
    // This maintains data integrity. If creating the profile fails, the employee record will be rolled back.
    const newEmployee = await client_1.prisma.$transaction(async (tx) => {
        const employee = await tx.employee.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role,
            },
        });
        await tx.profile.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfJoining: data.dateOfJoining,
                employeeId: employee.id, // Link the profile to the new employee
            },
        });
        return employee;
    });
    // 4. Return the new employee, omitting the password for security
    const { password: _, ...employeeWithoutPassword } = newEmployee;
    return employeeWithoutPassword;
};
exports.registerEmployee = registerEmployee;
/**
 * @async
 * @function getEmployeeProfile
 * @description Fetches the profile for a given employee ID.
 * @param {string} employeeId - The ID of the employee.
 * @returns {Promise<object>} The employee's data including their profile.
 */
const getEmployeeProfile = async (employeeId) => {
    const employee = await client_1.prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
            profile: true, // Eagerly load the related profile data
        },
    });
    if (!employee) {
        throw new apiError_1.ApiError(404, 'Employee not found');
    }
    const { password: _, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
};
exports.getEmployeeProfile = getEmployeeProfile;
/**
 * @async
 * @function updateEmployeeProfile
 * @description Updates an employee's profile.
 * @param {string} employeeId - The ID of the employee whose profile is to be updated.
 * @param {Prisma.ProfileUpdateInput} data - The data to update.
 * @returns {Promise<Profile>} The updated profile object.
 */
const updateEmployeeProfile = async (employeeId, data) => {
    return client_1.prisma.profile.update({
        where: { employeeId: employeeId },
        data,
    });
};
exports.updateEmployeeProfile = updateEmployeeProfile;
