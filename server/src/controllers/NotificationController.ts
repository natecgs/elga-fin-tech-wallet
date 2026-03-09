import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { NotificationModel } from '../models/NotificationModel.js';
import { ApiResponse } from '../types/index.js';

export class NotificationController {
  // Get all notifications
  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { limit } = req.query;
      const pageLimit = limit ? Math.min(parseInt(limit as string), 100) : 50;

      const notifications = await NotificationModel.findByUserId(req.user.id, pageLimit);

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  }

  // Get unread notifications
  static async getUnread(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const notifications = await NotificationModel.findUnread(req.user.id);
      const count = await NotificationModel.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: {
          notifications,
          count,
        },
      });
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch unread notifications' });
    }
  }

  // Mark notification as read
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await NotificationModel.markAsRead(notificationId);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, error: 'Failed to mark as read' });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await NotificationModel.markAllAsRead(req.user.id);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({ success: false, error: 'Failed to mark all as read' });
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await NotificationModel.delete(notificationId);

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
  }

  // Get unread count
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const count = await NotificationModel.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: {
          count,
        },
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
    }
  }
}
