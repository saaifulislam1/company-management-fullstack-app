import { PrismaClient } from '@prisma/client';

// By exporting a single instance of PrismaClient, we ensure that
// all parts of our application share the same database connection pool.
export const prisma = new PrismaClient();
