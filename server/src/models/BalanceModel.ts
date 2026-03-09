import pool from '../db/connection.js';
import { Balance } from '../types/index.js';

export class BalanceModel {
  static async findByUserId(userId: string): Promise<Balance[]> {
    const result = await pool.query(
      'SELECT * FROM balances WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  static async findByUserAndType(userId: string, type: string): Promise<Balance | null> {
    const result = await pool.query(
      'SELECT * FROM balances WHERE user_id = $1 AND type = $2',
      [userId, type]
    );
    return result.rows[0] || null;
  }

  static async upsert(
    userId: string,
    type: string,
    value: number,
    unit: string,
    expiresAt?: Date
  ): Promise<Balance> {
    const result = await pool.query(
      `INSERT INTO balances (user_id, type, value, unit, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, type) 
       DO UPDATE SET value = $3, unit = $4, expires_at = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, type, value, unit, expiresAt]
    );
    return result.rows[0];
  }

  static async updateBalance(userId: string, type: string, value: number): Promise<Balance> {
    const result = await pool.query(
      `UPDATE balances 
       SET value = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND type = $3
       RETURNING *`,
      [value, userId, type]
    );
    return result.rows[0];
  }

  static async incrementBalance(userId: string, type: string, amount: number): Promise<Balance> {
    const result = await pool.query(
      `UPDATE balances 
       SET value = value + $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND type = $3
       RETURNING *`,
      [amount, userId, type]
    );
    return result.rows[0];
  }
}
