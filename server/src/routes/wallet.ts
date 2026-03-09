import express from 'express';
import { WalletController } from '../controllers/WalletController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All wallet routes require authentication
router.use(authMiddleware);

// Wallet routes
router.get('/balance', WalletController.getWallet);
router.get('/balances', WalletController.getBalances);
router.post('/deposit', WalletController.deposit);
router.post('/withdraw', WalletController.withdraw);
router.post('/transfer', WalletController.transfer);

export default router;
