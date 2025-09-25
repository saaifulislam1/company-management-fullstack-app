"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
// @ts-nocheck
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * @function generateToken
 * @description Generates a JSON Web Token (JWT).
 * @param {string} employeeId - The ID of the employee.
 * @param {UserRole} role - The role of the employee.
 * @returns {string} The generated JWT.
 */
const generateToken = (employeeId, role) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;
    return jsonwebtoken_1.default.sign({ id: employeeId, role }, secret, {
        expiresIn,
    });
};
exports.generateToken = generateToken;
/**
 * @function verifyToken
 * @description Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {any | null} The decoded payload if the token is valid, otherwise null.
 */
const verifyToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET;
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
