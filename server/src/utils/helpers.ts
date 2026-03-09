import jwt from 'jsonwebtoken';

export function generateJWT(userId: string, phone: string): string {
  return jwt.sign({ userId, phone }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRY || '24h',
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry(): Date {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY || '10');
  const now = new Date();
  now.setMinutes(now.getMinutes() + expiryMinutes);
  return now;
}

export function getSessionExpiry(): Date {
  const expiryHours = 24;
  const now = new Date();
  now.setHours(now.getHours() + expiryHours);
  return now;
}

export function validatePhoneNumber(phone: string): boolean {
  // South African phone format: 27XXXXXXXXX
  const phoneRegex = /^27\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function maskPhoneNumber(phone: string): string {
  // Display as 27****653667
  const lastFour = phone.slice(-4);
  return `27****${lastFour}`;
}
