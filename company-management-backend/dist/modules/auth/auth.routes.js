"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../../middleware/validate");
const auth_validator_1 = require("./auth.validator");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
// Define the POST route for /login
// 1. It first runs the 'validate' middleware with our 'loginSchema'.
// 2. If validation passes, it then calls the 'login' controller.
router.post('/login', (0, validate_1.validate)(auth_validator_1.loginSchema), auth_controller_1.login);
exports.default = router;
