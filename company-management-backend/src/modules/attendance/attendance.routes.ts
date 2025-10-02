import { Router } from 'express';
import { protect } from '@/middleware/auth';
import {
  checkInController,
  checkOutController,
  getHistoryController,
} from './attendance.controller';

const router = Router();

// All attendance routes require the user to be logged in
router.use(protect);

router.post('/check-in', checkInController);
router.patch('/check-out', checkOutController);
router.get('/history', getHistoryController);

export default router;
