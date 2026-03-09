import pool from '../db/connection.js';
import { Transaction } from '../types/index.js';

export class TransactionModel {
  static async create(
    userId: string,
    type: string,
    amount: number,
    status: string,
    description?: string,
    recipientPhone?: string,
    metadata?: any
  ): Promise<Transaction> {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, currency, status, description, recipient_phone, metadata)
       VALUES ($1, $2, $3, 'ZAR', $4, $5, $6, $7)
       RETURNING *`,
      [userId, type, amount, status, description || null, recipientPhone || null, metadata ? JSON.stringify(metadata) : null]
    );
    return result.rows[0];
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<Transaction[]> {
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async findById(transactionId: string): Promise<Transaction | null> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [transactionId]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(transactionId: string, status: string): Promise<Transaction> {
    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING *`,
      [status, transactionId]
    );
    return result.rows[0];
  }

  static async findByReferenceId(referenceId: string): Promise<Transaction | null> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE reference_id = $1 LIMIT 1',
      [referenceId]
    );
    return result.rows[0] || null;
  }

  static async getSummary(userId: string): Promise<{ totalSpent: number; transactionCount: number }> {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as transaction_count,
        COALESCE(SUM(CASE WHEN type IN ('top-up', 'deposit') THEN amount ELSE 0 END), 0) as total_spent
       FROM transactions 
       WHERE user_id = $1 AND status = 'success'`,
      [userId]
    );
    return {
      totalSpent: parseFloat(result.rows[0].total_spent),
      transactionCount: parseInt(result.rows[0].transaction_count),
    };
  }
}
