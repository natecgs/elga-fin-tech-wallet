import pool from '../db/connection.js';
import { TopUpPackage } from '../types/index.js';

export class TopUpPackageModel {
  static async findAllByType(type: string): Promise<TopUpPackage[]> {
    const result = await pool.query(
      `SELECT * FROM topup_packages 
       WHERE type = $1 AND active = TRUE 
       ORDER BY price ASC`,
      [type]
    );
    return result.rows;
  }

  static async findAll(): Promise<TopUpPackage[]> {
    const result = await pool.query(
      `SELECT * FROM topup_packages 
       WHERE active = TRUE 
       ORDER BY type, price ASC`
    );
    return result.rows;
  }

  static async findById(id: string): Promise<TopUpPackage | null> {
    const result = await pool.query(
      'SELECT * FROM topup_packages WHERE id = $1 AND active = TRUE',
      [id]
    );
    return result.rows[0] || null;
  }
}
