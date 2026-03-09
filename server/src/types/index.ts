export interface User {
  id: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface OTP {
  id: string;
  phone: string;
  code: string;
  expires_at: Date;
  created_at: Date;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: Date;
}

export interface Balance {
  id: string;
  user_id: string;
  type: string;
  value: number;
  unit: string;
  expires_at: Date | null;
  updated_at: Date;
}

export interface Card {
  id: string;
  user_id: string;
  cardholder_name: string;
  card_number_last_4: string;
  expiry_month: number;
  expiry_year: number;
  billing_phone?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  reference_id: string | null;
  recipient_phone: string | null;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  action_url: string | null;
  created_at: Date;
}

export interface TopUpPackage {
  id: string;
  type: string;
  name: string;
  description: string | null;
  price: number;
  amount: number;
  unit: string;
  validity_days: number | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number | null;
  valid_from: Date | null;
  valid_until: Date | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  expiresAt: string;
  isNewUser?: boolean;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  code: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}
