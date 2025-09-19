/** This is a powerful utility!
 * It wraps our asynchronous controller functions to automatically
 *  catch any errors and pass them to our global error handler,
 *  so we don't need to write try...catch blocks everywhere. */

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * @function asyncHandler
 * @description A higher-order function that wraps an async Express route handler.
 * It catches any errors that occur in the async function and passes them to the
 * next middleware (our global error handler).
 * @param {RequestHandler} requestHandler - The async route handler function to wrap.
 * @returns {RequestHandler} An Express route handler.
 */
const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
