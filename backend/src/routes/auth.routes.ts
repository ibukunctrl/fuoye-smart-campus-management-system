import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { authenticate, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/agent/register', authLimiter, AuthController.agentRegister);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.get('/profile', authenticate, AuthController.getProfile);
router.patch('/profile', authenticate, AuthController.updateProfile);
router.patch('/password', authenticate, AuthController.changePassword);
router.get('/users/all', authenticate, adminMiddleware, AuthController.getAllUsers);

export default router;
