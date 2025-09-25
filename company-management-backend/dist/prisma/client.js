"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// By exporting a single instance of PrismaClient, we ensure that
// all parts of our application share the same database connection pool.
exports.prisma = new client_1.PrismaClient();
