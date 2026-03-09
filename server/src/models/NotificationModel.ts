import pool from '../db/connection.js';
import { Notification } from '../types/index.js';

export class NotificationModel {
  static async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async findUnread(userId: string): Promise<Notification[]> {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 AND read = FALSE 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async create(
    userId: string,
    title: string,
    message: string,
    type?: string,
    actionUrl?: string
  ): Promise<Notification> {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, action_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, type || null, actionUrl || null]
    );
    return result.rows[0];
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1',
      [notificationId]
    );
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
      [userId]
    );
  }

  static async delete(notificationId: string): Promise<void> {
    await pool.query('DELETE FROM notifications WHERE id = $1', [notificationId]);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
}
