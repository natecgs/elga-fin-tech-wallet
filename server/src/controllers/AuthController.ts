import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UserModel } from '../models/UserModel.js';
import { SessionModel } from '../models/SessionModel.js';
import { OTPModel } from '../models/OTPModel.js';
import { WalletModel } from '../models/WalletModel.js';
import { BalanceModel } from '../models/BalanceModel.js';
import { generateJWT, getOTPExpiry, getSessionExpiry, validatePhoneNumber } from '../utils/helpers.js';
import { AuthResponse, ApiResponse } from '../types/index.js';

export class AuthController {
  // Send OTP to phone number
  static async sendOtp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({ success: false, error: 'Phone number is required' });
        return;
      }

      // Validate phone format
      const formattedPhone = phone.replace(/\D/g, '');
      console.log('[OTP] sendOtp - Received phone:', phone, '-> Formatted:', formattedPhone);
      
      if (!validatePhoneNumber(formattedPhone)) {
        res.status(400).json({ success: false, error: 'Invalid phone number format' });
        return;
      }

      // Generate OTP
      const otp = OTPModel.generateOTP();
      const expiresAt = getOTPExpiry();
      console.log('[OTP] Generated OTP:', otp, 'Expires at:', expiresAt);

      // Save OTP to database
      await OTPModel.deleteByPhone(formattedPhone); // Delete any existing OTPs
      await OTPModel.create(formattedPhone, otp, expiresAt);
      console.log('[OTP] OTP saved for phone:', formattedPhone);

      // TODO: Send OTP via SMS (integrate with SMS provider)
      console.log(`Demo OTP for ${formattedPhone}: ${otp}`);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        demoOtp: otp, // For demo purposes only - remove in production
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
  }

  // Verify OTP and create session
  static async verifyOtp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        res.status(400).json({ success: false, error: 'Phone and OTP code are required' });
        return;
      }

      const formattedPhone = phone.replace(/\D/g, '');
      console.log('[OTP] verifyOtp - Received phone:', phone, '-> Formatted:', formattedPhone, '-> Code:', code);

      // Verify OTP and create session
      const otpRecord = await OTPModel.findValidOTP(formattedPhone, code);
      console.log('[OTP] OTP verification result:', otpRecord ? 'FOUND' : 'NOT FOUND');
      
      if (!otpRecord) {
        console.log('[OTP] Verification failed for phone:', formattedPhone, 'code:', code);
        res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
        return;
      }

      // Find or create user
      console.log('[OTP] Finding or creating user for phone:', formattedPhone);
      let user = await UserModel.findByPhone(formattedPhone);
      const isNewUser = !user;
      console.log('[OTP] User status:', isNewUser ? 'NEW USER' : 'EXISTING USER');

      if (!user) {
        console.log('[OTP] Creating new user...');
        user = await UserModel.create(formattedPhone);
        console.log('[OTP] New user created:', user.id);

        // Create wallet for new user
        console.log('[OTP] Creating wallet for user:', user.id);
        await WalletModel.create(user.id);
        console.log('[OTP] Wallet created');

        // Create default balances for new user
        const balanceTypes = [
          { type: 'airtime', value: 0, unit: 'ZAR' },
          { type: 'data', value: 0, unit: 'MB' },
          { type: 'minutes', value: 0, unit: 'min' },
          { type: 'sms', value: 0, unit: 'SMS' },
        ];

        for (const balance of balanceTypes) {
          await BalanceModel.upsert(user.id, balance.type, balance.value, balance.unit);
        }
        console.log('[OTP] Balances created');
      }

      // Delete old sessions
      console.log('[OTP] Deleting old sessions for user:', user.id);
      await SessionModel.deleteByUserId(user.id);

      // Generate JWT token
      const token = generateJWT(user.id, formattedPhone);
      const expiresAt = getSessionExpiry();
      console.log('[OTP] JWT token generated');

      // Create session
      console.log('[OTP] Creating session...');
      await SessionModel.create(user.id, token, expiresAt);
      console.log('[OTP] Session created');

      // Delete used OTP
      console.log('[OTP] Deleting used OTP...');
      await OTPModel.deleteByPhone(formattedPhone);
      console.log('[OTP] OTP deleted, verification complete!');

      // Convert to AuthUser
      const authUser = await UserModel.toAuthUser(user);

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          token,
          user: authUser,
          expiresAt: expiresAt.toISOString(),
          isNewUser,
        },
      };

      console.log('[OTP] Sending success response');
      res.json(response);
    } catch (error) {
      console.error('[OTP] ERROR verifying OTP:', error);
      res.status(500).json({ success: false, error: 'Failed to verify OTP' });
    }
  }

  // Validate session token
  static async validateSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ success: false, error: 'Token is required' });
        return;
      }

      const session = await SessionModel.findByToken(token);
      if (!session) {
        res.json({ success: false, valid: false });
        return;
      }

      const user = await UserModel.findById(session.user_id);
      if (!user) {
        res.json({ success: false, valid: false });
        return;
      }

      const authUser = await UserModel.toAuthUser(user);

      res.json({
        success: true,
        valid: true,
        user: authUser,
        expiresAt: session.expires_at.toISOString(),
      });
    } catch (error) {
      console.error('Error validating session:', error);
      res.json({ success: false, valid: false, error: 'Session validation failed' });
    }
  }

  // Update user profile
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { firstName, lastName } = req.body;

      const updatedUser = await UserModel.update(req.user.id, {
        first_name: firstName,
        last_name: lastName,
      });

      const authUser = await UserModel.toAuthUser(updatedUser);

      res.json({
        success: true,
        data: authUser,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  }

  // Logout
  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.token) {
        await SessionModel.deleteByToken(req.token);
      }

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({ success: false, error: 'Failed to logout' });
    }
  }
}
