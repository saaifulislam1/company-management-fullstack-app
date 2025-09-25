"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const asyncHandler_1 = require("@/utils/asyncHandler");
/**
 * @function validate
 * @description A middleware that validates the request body, query, and params against a Zod schema.
 * @param {AnyZodObject} schema - The Zod schema to validate against.
 */
const validate = (schema) => (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    // This will throw an error if validation fails, which will be caught by our asyncHandler
    // and passed to the global error handler.
    await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    next();
});
exports.validate = validate;
