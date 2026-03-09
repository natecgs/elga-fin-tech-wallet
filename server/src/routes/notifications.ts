import express from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/list', NotificationController.getNotifications);
router.get('/unread', NotificationController.getUnread);
router.get('/count', NotificationController.getUnreadCount);
router.post('/:notificationId/read', NotificationController.markAsRead);
router.post('/mark-all-read', NotificationController.markAllAsRead);
router.delete('/:notificationId', NotificationController.deleteNotification);

export default router;
