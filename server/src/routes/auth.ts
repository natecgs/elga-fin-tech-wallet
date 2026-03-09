import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/validate-session', AuthController.validateSession);

// Protected routes
router.post('/update-profile', authMiddleware, AuthController.updateProfile);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
