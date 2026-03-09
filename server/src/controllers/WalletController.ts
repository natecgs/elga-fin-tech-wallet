import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { WalletModel } from '../models/WalletModel.js';
import { BalanceModel } from '../models/BalanceModel.js';
import { TransactionModel } from '../models/TransactionModel.js';
import { NotificationModel } from '../models/NotificationModel.js';
import { ApiResponse } from '../types/index.js';

export class WalletController {
  // Get wallet balance
  static async getWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const wallet = await WalletModel.findByUserId(req.user.id);
      if (!wallet) {
        res.status(404).json({ success: false, error: 'Wallet not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          id: wallet.id,
          balance: parseFloat(wallet.balance as any),
          currency: wallet.currency,
          updatedAt: wallet.updated_at,
        },
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch wallet' });
    }
  }

  // Get all balances (airtime, data, minutes, SMS)
  static async getBalances(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const balances = await BalanceModel.findByUserId(req.user.id);

      // Format balances for frontend
      const formattedBalances: Record<string, string> = {
        airtime: 'R0.00',
        data: '0 MB',
        minutes: '0 min',
        sms: '0 SMS',
        wallet: 'R0.00',
      };

      const wallet = await WalletModel.findByUserId(req.user.id);
      if (wallet) {
        formattedBalances.wallet = `R${parseFloat(wallet.balance as any).toFixed(2)}`;
      }

      for (const balance of balances) {
        const balanceValue = parseFloat(balance.value as any);
        if (balance.type === 'airtime') {
          formattedBalances.airtime = `R${balanceValue.toFixed(2)}`;
        } else if (balance.type === 'data') {
          formattedBalances.data = `${Math.round(balanceValue)} ${balance.unit}`;
        } else if (balance.type === 'minutes') {
          formattedBalances.minutes = `${Math.round(balanceValue)} ${balance.unit}`;
        } else if (balance.type === 'sms') {
          formattedBalances.sms = `${Math.round(balanceValue)} ${balance.unit}`;
        }
      }

      res.json({
        success: true,
        data: formattedBalances,
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch balances' });
    }
  }

  // Add funds to wallet
  static async deposit(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { amount, cardId } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ success: false, error: 'Invalid amount' });
        return;
      }

      // Create transaction
      const transaction = await TransactionModel.create(
        req.user.id,
        'deposit',
        amount,
        'success',
        `Wallet deposit of R${amount.toFixed(2)}`
      );

      // Update wallet
      const wallet = await WalletModel.updateBalance(req.user.id, amount);

      // Create notification
      await NotificationModel.create(
        req.user.id,
        'Deposit Successful',
        `Successfully deposited R${amount.toFixed(2)} to your wallet`
      );

      res.json({
        success: true,
        message: 'Deposit successful',
        data: {
          transactionId: transaction.id,
          newBalance: parseFloat(wallet.balance as any),
        },
      });
    } catch (error) {
      console.error('Error processing deposit:', error);
      res.status(500).json({ success: false, error: 'Failed to process deposit' });
    }
  }

  // Withdraw funds from wallet
  static async withdraw(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { amount, bankAccount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ success: false, error: 'Invalid amount' });
        return;
      }

      // Check if wallet has sufficient balance
      const wallet = await WalletModel.findByUserId(req.user.id);
      if (!wallet || parseFloat(wallet.balance as any) < amount) {
        res.status(400).json({ success: false, error: 'Insufficient balance' });
        return;
      }

      // Create transaction
      const transaction = await TransactionModel.create(
        req.user.id,
        'withdrawal',
        amount,
        'pending',
        `Wallet withdrawal of R${amount.toFixed(2)}`
      );

      // Update wallet
      const updatedWallet = await WalletModel.updateBalance(req.user.id, -amount);

      // Create notification
      await NotificationModel.create(
        req.user.id,
        'Withdrawal Initiated',
        `Withdrawal of R${amount.toFixed(2)} is being processed`
      );

      res.json({
        success: true,
        message: 'Withdrawal initiated',
        data: {
          transactionId: transaction.id,
          newBalance: parseFloat(updatedWallet.balance as any),
        },
      });
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      res.status(500).json({ success: false, error: 'Failed to process withdrawal' });
    }
  }

  // Transfer funds to another user
  static async transfer(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { recipientPhone, amount, description } = req.body;

      if (!recipientPhone || !amount || amount <= 0) {
        res.status(400).json({ success: false, error: 'Invalid input' });
        return;
      }

      if (recipientPhone === req.user.phone) {
        res.status(400).json({ success: false, error: 'Cannot transfer to yourself' });
        return;
      }

      // Check sender wallet balance
      const senderWallet = await WalletModel.findByUserId(req.user.id);
      if (!senderWallet || parseFloat(senderWallet.balance as any) < amount) {
        res.status(400).json({ success: false, error: 'Insufficient balance' });
        return;
      }

      // Create transaction for sender
      const transaction = await TransactionModel.create(
        req.user.id,
        'transfer',
        amount,
        'success',
        description || `Transfer to ${recipientPhone}`,
        recipientPhone
      );

      // Deduct from sender
      await WalletModel.updateBalance(req.user.id, -amount);

      // Add to recipient (if exists in system)
      // In real system, would verify recipient exists
      // await WalletModel.updateBalance(recipientId, amount);

      // Create notification
      await NotificationModel.create(
        req.user.id,
        'Transfer Sent',
        `Successfully transferred R${amount.toFixed(2)} to ${recipientPhone}`
      );

      res.json({
        success: true,
        message: 'Transfer successful',
        data: {
          transactionId: transaction.id,
        },
      });
    } catch (error) {
      console.error('Error processing transfer:', error);
      res.status(500).json({ success: false, error: 'Failed to process transfer' });
    }
  }
}
