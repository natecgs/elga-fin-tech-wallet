import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { TopUpPackageModel } from '../models/TopUpPackageModel.js';
import { BalanceModel } from '../models/BalanceModel.js';
import { WalletModel } from '../models/WalletModel.js';
import { TransactionModel } from '../models/TransactionModel.js';
import { NotificationModel } from '../models/NotificationModel.js';
import { ApiResponse } from '../types/index.js';

export class TopUpController {
  // Get available top-up packages
  static async getPackages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.query;

      let packages;
      if (type) {
        packages = await TopUpPackageModel.findAllByType(type as string);
      } else {
        packages = await TopUpPackageModel.findAll();
      }

      res.json({
        success: true,
        data: packages,
      });
    } catch (error) {
      console.error('Error fetching top-up packages:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch packages' });
    }
  }

  // Get packages by type
  static async getPackagesByType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.params;

      if (!type) {
        res.status(400).json({ success: false, error: 'Type is required' });
        return;
      }

      const packages = await TopUpPackageModel.findAllByType(type);

      res.json({
        success: true,
        data: packages,
      });
    } catch (error) {
      console.error('Error fetching packages:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch packages' });
    }
  }

  // Purchase top-up package
  static async purchaseTopUp(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { packageId, paymentMethod } = req.body;

      if (!packageId) {
        res.status(400).json({ success: false, error: 'Package ID is required' });
        return;
      }

      // Get package details
      const pkg = await TopUpPackageModel.findById(packageId);
      if (!pkg) {
        res.status(404).json({ success: false, error: 'Package not found' });
        return;
      }

      // Get wallet
      const wallet = await WalletModel.findByUserId(req.user.id);
      if (!wallet || parseFloat(wallet.balance as any) < parseFloat(pkg.price as any)) {
        res.status(400).json({ success: false, error: 'Insufficient balance' });
        return;
      }

      // Create transaction
      const pkgPrice = parseFloat(pkg.price as any);
      const transaction = await TransactionModel.create(
        req.user.id,
        `top-up-${pkg.type}`,
        pkgPrice,
        'success',
        `Purchased ${pkg.name}`
      );

      // Deduct from wallet
      await WalletModel.updateBalance(req.user.id, -pkgPrice);

      // Update balance
      const expiresAt = pkg.validity_days
        ? new Date(Date.now() + pkg.validity_days * 24 * 60 * 60 * 1000)
        : undefined;

      await BalanceModel.upsert(req.user.id, pkg.type, pkg.amount, pkg.unit, expiresAt);

      // Create notification
      await NotificationModel.create(
        req.user.id,
        'Top-up Successful',
        `Successfully purchased ${pkg.name} for R${parseFloat(pkg.price as any).toFixed(2)}`
      );

      res.json({
        success: true,
        message: 'Top-up purchase successful',
        data: {
          transactionId: transaction.id,
          package: {
            id: pkg.id,
            name: pkg.name,
            amount: pkg.amount,
            unit: pkg.unit,
            price: pkg.price,
          },
          newWalletBalance: parseFloat(wallet.balance as any) - pkgPrice,
        },
      });
    } catch (error) {
      console.error('Error processing top-up:', error);
      res.status(500).json({ success: false, error: 'Failed to process top-up' });
    }
  }

  // Redeem voucher
  static async redeemVoucher(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { voucherPin } = req.body;

      if (!voucherPin) {
        res.status(400).json({ success: false, error: 'Voucher PIN is required' });
        return;
      }

      // TODO: Verify voucher with provider
      // For now, simulate a fixed value
      const voucherValue = 50; // Example: R50

      // Create transaction
      const transaction = await TransactionModel.create(
        req.user.id,
        'voucher-redeem',
        0, // No cost
        'success',
        `Redeemed voucher for R${voucherValue.toFixed(2)}`
      );

      // Add to wallet
      const wallet = await WalletModel.updateBalance(req.user.id, voucherValue);

      // Create notification
      await NotificationModel.create(
        req.user.id,
        'Voucher Redeemed',
        `Successfully redeemed voucher for R${voucherValue.toFixed(2)}`
      );

      res.json({
        success: true,
        message: 'Voucher redeemed successfully',
        data: {
          transactionId: transaction.id,
          voucherValue,
          newWalletBalance: wallet.balance,
        },
      });
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      res.status(500).json({ success: false, error: 'Failed to redeem voucher' });
    }
  }
}
