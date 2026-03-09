import pool from '../db/connection.js';
import { OTP } from '../types/index.js';

export class OTPModel {
  static async create(phone: string, code: string, expiresAt: Date): Promise<OTP> {
    const result = await pool.query(
      `INSERT INTO otps (phone, code, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [phone, code, expiresAt]
    );
    return result.rows[0];
  }

  static async findValidOTP(phone: string, code: string): Promise<OTP | null> {
    console.log('[OTPModel] Searching for OTP - phone:', phone, 'code:', code, 'code type:', typeof code);
    
    // First, check if ANY OTP exists for this phone (regardless of code match)
    const allOtpsResult = await pool.query(
      `SELECT phone, code, expires_at FROM otps 
       WHERE phone = $1
       ORDER BY created_at DESC LIMIT 5`,
      [phone]
    );
    console.log('[OTPModel] All OTPs in DB for this phone:', allOtpsResult.rows);

    const result = await pool.query(
      `SELECT * FROM otps 
       WHERE phone = $1 AND code = $2 AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [phone, code]
    );
    
    console.log('[OTPModel] Query result:', result.rows.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (result.rows.length > 0) {
      console.log('[OTPModel] Found OTP:', result.rows[0]);
    }
    return result.rows[0] || null;
  }

  static async deleteByPhone(phone: string): Promise<void> {
    await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
  }

  // For demo purposes - generate OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
