import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { comparePassword } from '@/utils/password';
import { generateToken } from '@/utils/jwt';

import { redis } from '@/config/redis'; // <-- Import Redis client
import { randomBytes } from 'crypto';
/**
 * @async
 * @function loginEmployee
 * @description Service function to handle employee login.
 * @param {string} email - The employee's email.
 * @param {string} password - The employee's plain-text password.
 * @returns {Promise<object>} An object containing the logged-in employee (without password) and the JWT.
 */
// export const loginEmployee = async (email: string, password: string) => {
//   // 1. Find the employee by email
//   const employee = await prisma.employee.findUnique({
//     where: { email },
//   });

//   // 2. If no employee is found, or if the password doesn't match, throw an error
//   if (!employee || !(await comparePassword(password, employee.password))) {
//     throw new ApiError(401, 'Invalid email or password');
//   }

//   // 3. Generate a JWT for the authenticated employee
//   const token = generateToken(employee.id, employee.role);

//   // 4. Remove the password from the employee object before returning it
//   const { password: _, ...employeeWithoutPassword } = employee;

//   return { employee: employeeWithoutPassword, token };
// };
export const loginEmployee = async (email: string, password: string) => {
  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee || !(await comparePassword(password, employee.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // --- NEW SESSION LOGIC ---
  // 1. Generate a secure, random session ID
  const sessionId = randomBytes(32).toString('hex');

  // 2. Prepare user data for the session (without the password)
  const { password: _, ...employeeDataForSession } = employee;

  // 3. Store the session data in Redis with an expiration time (e.g., 7 days)
  await redis.set(
    `session:${sessionId}`,
    JSON.stringify(employeeDataForSession),
    'EX',
    60 * 60 * 24 * 7,
  );

  // 4. Generate a JWT that contains ONLY the session ID
  const token = generateToken({ sessionId });

  // 5. Return the token and user data for the initial login response
  return { employee: employeeDataForSession, token };
};

export const logoutEmployee = async (sessionId: string) => {
  await redis.del(`session:${sessionId}`);
  return { message: 'Logged out successfully' };
};
