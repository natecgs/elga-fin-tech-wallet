import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { CardModel } from '../models/CardModel.js';
import { ApiResponse } from '../types/index.js';

export class CardController {
  // Get all cards
  static async getAllCards(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const cards = await CardModel.findByUserId(req.user.id);

      res.json({
        success: true,
        data: cards,
      });
    } catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch cards' });
    }
  }

  // Get card by ID
  static async getCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cardId } = req.params;

      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const card = await CardModel.findById(cardId);

      if (!card || card.user_id !== req.user.id) {
        res.status(404).json({ success: false, error: 'Card not found' });
        return;
      }

      res.json({
        success: true,
        data: card,
      });
    } catch (error) {
      console.error('Error fetching card:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch card' });
    }
  }

  // Add new card
  static async addCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv, billingPhone } = req.body;

      // Validate inputs
      if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      // Validate card number format (basic check)
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cleanCardNumber)) {
        res.status(400).json({ success: false, error: 'Invalid card number' });
        return;
      }

      // Get last 4 digits
      const cardLast4 = cleanCardNumber.slice(-4);

      // Create card
      const card = await CardModel.create(
        req.user.id,
        cardholderName,
        cardLast4,
        parseInt(expiryMonth),
        parseInt(expiryYear),
        billingPhone || ''
      );

      res.json({
        success: true,
        message: 'Card added successfully',
        data: card,
      });
    } catch (error) {
      console.error('Error adding card:', error);
      res.status(500).json({ success: false, error: 'Failed to add card' });
    }
  }

  // Delete card
  static async deleteCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cardId } = req.params;

      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Verify card ownership
      const card = await CardModel.findById(cardId);
      if (!card || card.user_id !== req.user.id) {
        res.status(404).json({ success: false, error: 'Card not found' });
        return;
      }

      await CardModel.delete(cardId);

      res.json({
        success: true,
        message: 'Card deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      res.status(500).json({ success: false, error: 'Failed to delete card' });
    }
  }

  // Set default card
  static async setDefaultCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cardId } = req.params;

      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Verify card ownership
      const card = await CardModel.findById(cardId);
      if (!card || card.user_id !== req.user.id) {
        res.status(404).json({ success: false, error: 'Card not found' });
        return;
      }

      await CardModel.setDefault(req.user.id, cardId);

      res.json({
        success: true,
        message: 'Default card updated',
      });
    } catch (error) {
      console.error('Error setting default card:', error);
      res.status(500).json({ success: false, error: 'Failed to set default card' });
    }
  }
}
