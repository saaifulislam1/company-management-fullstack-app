// @ts-nocheck
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import config from '../config'; // <-- Add this line

export const generateToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN as string;

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): any => {
  try {
    const secret = process.env.JWT_SECRET as string;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
