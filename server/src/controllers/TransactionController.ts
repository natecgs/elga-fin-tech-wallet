import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { TransactionModel } from '../models/TransactionModel.js';
import { ApiResponse } from '../types/index.js';

export class TransactionController {
  // Get all transactions
  static async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { limit } = req.query;
      const pageLimit = limit ? Math.min(parseInt(limit as string), 100) : 50;

      const transactions = await TransactionModel.findByUserId(req.user.id, pageLimit);

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
  }

  // Get transaction by ID
  static async getTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const transaction = await TransactionModel.findById(transactionId);

      if (!transaction || transaction.user_id !== req.user.id) {
        res.status(404).json({ success: false, error: 'Transaction not found' });
        return;
      }

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transaction' });
    }
  }

  // Get transaction summary
  static async getSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const summary = await TransactionModel.getSummary(req.user.id);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch summary' });
    }
  }
}
