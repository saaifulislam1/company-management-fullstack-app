import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler';

/**
 * @function validate
 * @description A middleware that validates the request body, query, and params against a Zod schema.
 * @param {AnyZodObject} schema - The Zod schema to validate against.
 */
export const validate = (schema: AnyZodObject) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    // This will throw an error if validation fails, which will be caught by our asyncHandler
    // and passed to the global error handler.
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
