import { Request, Response, NextFunction } from 'express';
// Import the base 'z' object
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';

/**
 * @function validate
 * @description A middleware that validates the request body, query, and params against a Zod schema.
 * @param {z.Schema} schema - The Zod schema to validate against.
 */
export const validate = (schema: z.Schema) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
