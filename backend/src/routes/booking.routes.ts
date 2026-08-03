import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { authenticate, agentMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createBookingSchema } from '../schemas/booking.schema.js';
import { apiLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// Protect all booking endpoints with JWT authentication and rate limiting
router.use(authenticate);
router.use(apiLimiter);

router.post('/', validate(createBookingSchema), BookingController.createBooking);
router.get('/my', BookingController.getMyBookings);
router.get('/agent/my', agentMiddleware, BookingController.getAgentBookings);
router.get('/all', BookingController.getAllBookings);
router.patch('/:id/cancel', BookingController.cancelBooking);
router.patch('/:id/status', BookingController.updateBookingStatus);

export default router;
