import pool from '../db/connection.js';
import { User, AuthUser } from '../types/index.js';

export class UserModel {
  static async findByPhone(phone: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(phone: string): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (phone) VALUES ($1) RETURNING *',
      [phone]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(data.last_name);
    }
    if (data.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(data.avatar_url);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async toAuthUser(user: User): Promise<AuthUser> {
    return {
      id: user.id,
      phone: user.phone,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      avatarUrl: user.avatar_url || '',
    };
  }
}
