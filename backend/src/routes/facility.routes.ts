import { Router } from 'express';
import { FacilityController } from '../controllers/facility.controller.js';
import { UploadController, upload } from '../controllers/upload.controller.js';
import { apiLimiter } from '../middlewares/rateLimit.middleware.js';
import { adminMiddleware, authenticate, adminOrAgentMiddleware, agentMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(apiLimiter);

// Public browsing endpoints (cached by Redis in production)
router.get('/hostels', FacilityController.getAllHostels);
router.get('/classrooms', FacilityController.getAllClassrooms);
router.get('/rooms/:roomId/schedule', FacilityController.getRoomSchedule); // Must be before /:slug
router.get('/:slug', FacilityController.getFacilityDetails);

// Agent specific endpoints
router.get('/agent/my', authenticate, agentMiddleware, FacilityController.getAgentFacilities);

// Admin / Agent facility management endpoints
router.post('/', authenticate, adminOrAgentMiddleware, FacilityController.createFacility);
router.patch('/:id', authenticate, adminOrAgentMiddleware, FacilityController.updateFacility);
router.delete('/:id', authenticate, adminMiddleware, FacilityController.deleteFacility); // Only admin can delete

// Image upload — admin or agent can upload, 10 MB limit handled by multer inside controller
router.post(
  '/:id/image',
  authenticate,
  adminOrAgentMiddleware,
  upload.single('image'),
  UploadController.uploadFacilityImage,
);

export default router;
