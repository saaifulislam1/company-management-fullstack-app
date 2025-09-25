"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("@/middleware/validate");
const auth_1 = require("@/middleware/auth");
const role_1 = require("@/middleware/role");
const employee_validator_1 = require("../validators/employee.validator");
const employee_controller_1 = require("../controllers/employee.controller");
const router = (0, express_1.Router)();
// Route for registering a new employee
// Execution Flow:
// 1. `protect`: Checks if a valid JWT is provided.
// 2. `authorize('ADMIN', 'HR')`: Checks if the logged-in user's role is ADMIN or HR.
// 3. `validate(registerEmployeeSchema)`: Validates the request body.
// 4. `register`: If all above pass, the controller is executed.
router.post('/register', auth_1.protect, (0, role_1.authorize)('ADMIN', 'HR'), (0, validate_1.validate)(employee_validator_1.registerEmployeeSchema), employee_controller_1.register);
// We can chain routes for the same path ('/me')
router
    .route('/me')
    // GET /api/v1/employees/me
    .get(auth_1.protect, employee_controller_1.getMe) // Any logged-in user can access this.
    // PATCH /api/v1/employees/me
    .patch(auth_1.protect, (0, validate_1.validate)(employee_validator_1.updateProfileSchema), employee_controller_1.updateMe); // Any logged-in user can access this.
exports.default = router;
