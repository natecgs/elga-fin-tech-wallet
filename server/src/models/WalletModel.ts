import pool from '../db/connection.js';
import { Wallet } from '../types/index.js';

export class WalletModel {
  static async findByUserId(userId: string): Promise<Wallet | null> {
    const result = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  static async create(userId: string): Promise<Wallet> {
    const result = await pool.query(
      `INSERT INTO wallets (user_id, balance, currency) 
       VALUES ($1, 0.00, 'ZAR') 
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  }

  static async updateBalance(userId: string, amount: number): Promise<Wallet> {
    const result = await pool.query(
      `UPDATE wallets 
       SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, userId]
    );
    return result.rows[0];
  }

  static async setBalance(userId: string, amount: number): Promise<Wallet> {
    const result = await pool.query(
      `UPDATE wallets 
       SET balance = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, userId]
    );
    return result.rows[0];
  }
}
