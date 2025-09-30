import { Router } from 'express';
import { protect } from '@/middleware/auth';
import { authorize } from '@/middleware/role';
import { validate } from '@/middleware/validate';
import * as validator from './leave.validator';
import * as controller from './leave.controller';

const router = Router();

// All leave routes are protected
router.use(protect);

// Employee routes
router.post(
  '/apply',
  validate(validator.applyLeaveSchema),
  controller.applyLeaveController,
);
router.get('/history', controller.getHistoryController);

// Admin/HR routes
router.get(
  '/requests',
  authorize('ADMIN', 'HR'),
  controller.getAllRequestsController,
);
router.get('/team-requests', protect, controller.getTeamRequestsController);
router.patch(
  '/team-requests/:leaveId',

  protect,
  validate(validator.updateLeaveStatusSchema),
  controller.managerUpdateStatusController,
);
router.patch(
  '/requests/:leaveId',
  authorize('ADMIN', 'HR'),
  validate(validator.updateLeaveStatusSchema),
  controller.updateStatusController,
);

export default router;
