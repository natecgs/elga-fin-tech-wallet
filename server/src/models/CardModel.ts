import pool from '../db/connection.js';
import { Card } from '../types/index.js';

export class CardModel {
  static async findByUserId(userId: string): Promise<Card[]> {
    const result = await pool.query(
      `SELECT id, user_id, cardholder_name, card_number_last_4, expiry_month, 
              expiry_year, billing_phone, is_default, created_at, updated_at
       FROM cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findById(cardId: string): Promise<Card | null> {
    const result = await pool.query(
      `SELECT id, user_id, cardholder_name, card_number_last_4, expiry_month, 
              expiry_year, billing_phone, is_default, created_at, updated_at
       FROM cards WHERE id = $1`,
      [cardId]
    );
    return result.rows[0] || null;
  }

  static async create(
    userId: string,
    cardholderName: string,
    cardNumberLast4: string,
    expiryMonth: number,
    expiryYear: number,
    billingPhone: string
  ): Promise<Card> {
    const result = await pool.query(
      `INSERT INTO cards (user_id, cardholder_name, card_number_last_4, expiry_month, expiry_year, billing_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, cardholder_name, card_number_last_4, expiry_month, 
                 expiry_year, billing_phone, is_default, created_at, updated_at`,
      [userId, cardholderName, cardNumberLast4, expiryMonth, expiryYear, billingPhone]
    );
    return result.rows[0];
  }

  static async delete(cardId: string): Promise<void> {
    await pool.query('DELETE FROM cards WHERE id = $1', [cardId]);
  }

  static async setDefault(userId: string, cardId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE cards SET is_default = FALSE WHERE user_id = $1', [userId]);
      await client.query('UPDATE cards SET is_default = TRUE WHERE id = $1', [cardId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
