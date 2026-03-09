import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { SessionModel } from '../models/SessionModel.js';
import { UserModel } from '../models/UserModel.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
  };
  token?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.substring(7);

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      phone: string;
    };

    // Verify session in database
    const session = await SessionModel.findByToken(token);
    if (!session) {
      res.status(401).json({ success: false, error: 'Invalid or expired session' });
      return;
    }

    // Verify user still exists and is not deleted
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = {
      id: decoded.userId,
      phone: decoded.phone,
    };
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}
