import express from 'express';
import { TopUpController } from '../controllers/TopUpController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/packages', TopUpController.getPackages);

// Protected routes
router.use(authMiddleware);

router.get('/packages/:type', TopUpController.getPackagesByType);
router.post('/purchase', TopUpController.purchaseTopUp);
router.post('/redeem-voucher', TopUpController.redeemVoucher);

export default router;
