import pool from '../db/connection.js';
import { Session } from '../types/index.js';

export class SessionModel {
  static async create(userId: string, token: string, expiresAt: Date): Promise<Session> {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  static async findByToken(token: string): Promise<Session | null> {
    const result = await pool.query(
      `SELECT * FROM sessions 
       WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [token]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<Session | null> {
    const result = await pool.query(
      `SELECT * FROM sessions 
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async deleteByToken(token: string): Promise<void> {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  static async deleteByUserId(userId: string): Promise<void> {
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  }
}
