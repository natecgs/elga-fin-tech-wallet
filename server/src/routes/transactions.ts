import express from 'express';
import { TransactionController } from '../controllers/TransactionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All transaction routes require authentication
router.use(authMiddleware);

router.get('/list', TransactionController.getTransactions);
router.get('/:transactionId', TransactionController.getTransaction);
router.get('/summary/overview', TransactionController.getSummary);

export default router;
