import express from 'express';
import { CardController } from '../controllers/CardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All card routes require authentication
router.use(authMiddleware);

router.get('/list', CardController.getAllCards);
router.get('/:cardId', CardController.getCard);
router.post('/add', CardController.addCard);
router.delete('/:cardId', CardController.deleteCard);
router.post('/:cardId/set-default', CardController.setDefaultCard);

export default router;
