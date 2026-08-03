import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bookingRoutes from './booking.routes.js';
import facilityRoutes from './facility.routes.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/health', (_req, res) => {
  return sendSuccess(res, 200, { status: 'UP', timestamp: new Date().toISOString() }, 'FUOYE Smart Campus Backend is running healthy');
});

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/facilities', facilityRoutes);

export default router;
