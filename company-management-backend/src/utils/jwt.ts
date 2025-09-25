// @ts-nocheck
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

/**
 * @function generateToken
 * @description Generates a JSON Web Token (JWT).
 * @param {string} employeeId - The ID of the employee.
 * @param {UserRole} role - The role of the employee.
 * @returns {string} The generated JWT.
 */
export const generateToken = (employeeId: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN as string;

  return jwt.sign({ id: employeeId, role }, secret, {
    expiresIn,
  });
};

/**
 * @function verifyToken
 * @description Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {any | null} The decoded payload if the token is valid, otherwise null.
 */
export const verifyToken = (token: string): any => {
  try {
    const secret = process.env.JWT_SECRET as string;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
