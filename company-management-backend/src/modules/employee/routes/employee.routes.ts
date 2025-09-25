import { Router } from 'express';
import { validate } from '@/middleware/validate';
import { protect } from '@/middleware/auth';
import { authorize } from '@/middleware/role';
import {
  registerEmployeeSchema,
  updateProfileSchema,
} from '../validators/employee.validator';
import {
  register,
  getMe,
  updateMe,
  getAllEmployees,
} from '../controllers/employee.controller';

const router = Router();

// Route for registering a new employee
// Execution Flow:
// 1. `protect`: Checks if a valid JWT is provided.
// 2. `authorize('ADMIN', 'HR')`: Checks if the logged-in user's role is ADMIN or HR.
// 3. `validate(registerEmployeeSchema)`: Validates the request body.
// 4. `register`: If all above pass, the controller is executed.
router.post(
  '/register',
  protect,
  authorize('ADMIN', 'HR'),
  validate(registerEmployeeSchema),
  register,
);

// We can chain routes for the same path ('/me')
router
  .route('/me')
  // GET /api/v1/employees/me
  .get(protect, getMe) // Any logged-in user can access this.
  // PATCH /api/v1/employees/me
  .patch(protect, validate(updateProfileSchema), updateMe); // Any logged-in user can access this.
router.get('/', protect, authorize('ADMIN', 'HR'), getAllEmployees);
export default router;
