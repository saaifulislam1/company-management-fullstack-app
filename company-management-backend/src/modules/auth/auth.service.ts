import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { comparePassword } from '@/utils/password';
import { generateToken } from '@/utils/jwt';

/**
 * @async
 * @function loginEmployee
 * @description Service function to handle employee login.
 * @param {string} email - The employee's email.
 * @param {string} password - The employee's plain-text password.
 * @returns {Promise<object>} An object containing the logged-in employee (without password) and the JWT.
 */
export const loginEmployee = async (email: string, password: string) => {
  // 1. Find the employee by email
  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  // 2. If no employee is found, or if the password doesn't match, throw an error
  if (!employee || !(await comparePassword(password, employee.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 3. Generate a JWT for the authenticated employee
  const token = generateToken(employee.id, employee.role);

  // 4. Remove the password from the employee object before returning it
  const { password: _, ...employeeWithoutPassword } = employee;

  return { employee: employeeWithoutPassword, token };
};
