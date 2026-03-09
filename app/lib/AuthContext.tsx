import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from './api';
import { AppStorage } from './storage';

const SESSION_KEY = 'fintech_session';
const USER_KEY = 'fintech_user';

export interface AuthUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsRegistration: boolean;
}

interface AuthContextType extends AuthState {
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string; demoOtp?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  updateProfile: (firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setNeedsRegistration: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  needsRegistration: false,
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  logout: async () => {},
  setNeedsRegistration: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = !!user && !!token && !needsRegistration;

  // Schedule auto-logout when session expires
  const scheduleExpiry = useCallback((expiresAt: string) => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
    }
    const msUntilExpiry = new Date(expiresAt).getTime() - Date.now();
    if (msUntilExpiry > 0) {
      expiryTimerRef.current = setTimeout(() => {
        console.log('Session expired, logging out');
        clearSession();
      }, msUntilExpiry);
    } else {
      clearSession();
    }
  }, []);

  const clearSession = async () => {
    console.log('[AUTH] clearSession called - clearing user state');
    setUser(null);
    console.log('[AUTH] User state cleared');
    setToken(null);
    console.log('[AUTH] Token cleared');
    setNeedsRegistration(false);
    console.log('[AUTH] needsRegistration cleared');
    try {
      await AppStorage.removeItem(SESSION_KEY);
      console.log('[AUTH] SESSION_KEY removed from storage');
      await AppStorage.removeItem(USER_KEY);
      console.log('[AUTH] USER_KEY removed from storage');
    } catch (err) {
      console.error('[AUTH] Error removing items from storage:', err);
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      console.log('[AUTH] Expiry timer cleared');
    }
    console.log('[AUTH] clearSession completed');
  };

  const persistSession = async (sessionToken: string, userData: AuthUser, expiresAt: string) => {
    await AppStorage.setItem(SESSION_KEY, JSON.stringify({ token: sessionToken, expiresAt }));
    await AppStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  // Check for existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionStr = await AppStorage.getItem(SESSION_KEY);
        const userStr = await AppStorage.getItem(USER_KEY);

        if (!sessionStr || !userStr) {
          setIsLoading(false);
          return;
        }

        const session = JSON.parse(sessionStr);
        const cachedUser = JSON.parse(userStr);

        // Quick check: is session expired locally?
        if (new Date(session.expiresAt) < new Date()) {
          await clearSession();
          setIsLoading(false);
          return;
        }

        // Validate session with server
        try {
          apiClient.setToken(session.token);
          const response = await apiClient.post('/auth/validate-session', { token: session.token });
          const data = response.data;

          if (!data.success || !data.valid) {
            await clearSession();
            setIsLoading(false);
            return;
          }

          // Check if user needs registration (no name set)
          const serverUser = data.user as AuthUser;
          if (!serverUser.firstName && !serverUser.lastName) {
            setToken(session.token);
            setUser(serverUser);
            setNeedsRegistration(true);
            setIsLoading(false);
            return;
          }

          setToken(session.token);
          setUser(serverUser);
          scheduleExpiry(data.expiresAt);
          setIsLoading(false);
        } catch (error) {
          console.error('Session validation error:', error);
          await clearSession();
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Session restore error:', err);
        await clearSession();
        setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, []);

  const sendOtp = async (phone: string): Promise<{ success: boolean; error?: string; demoOtp?: string }> => {
    try {
      // Convert phone from 0XXXXXXXXX to 27XXXXXXXXX format
      const formattedPhone = phone.startsWith('0') ? '27' + phone.substring(1) : phone;
      const response = await apiClient.post('/auth/send-otp', { phone: formattedPhone });
      const data = response.data;

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to send OTP. Please try again.' };
      }

      return { success: true, demoOtp: data.demoOtp };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Network error';
      console.error('sendOtp error:', err.response?.status, err.response?.data);
      return { success: false, error: errorMessage };
    }
  };

  const verifyOtp = async (phone: string, code: string): Promise<{ success: boolean; error?: string; isNewUser?: boolean }> => {
    try {
      // Convert phone from 0XXXXXXXXX to 27XXXXXXXXX format
      const formattedPhone = phone.startsWith('0') ? '27' + phone.substring(1) : phone;
      const response = await apiClient.post('/auth/verify-otp', { phone: formattedPhone, code });
      const data = response.data;

      if (!data.success) {
        return { success: false, error: data.error || 'Verification failed. Please try again.' };
      }

      const userData = data.data.user as AuthUser;
      setToken(data.data.token);
      setUser(userData);
      apiClient.setToken(data.data.token);

      if (data.data.isNewUser || (!userData.firstName && !userData.lastName)) {
        setNeedsRegistration(true);
        // Persist session even for new users so they can complete registration
        await persistSession(data.data.token, userData, data.data.expiresAt);
        return { success: true, isNewUser: true };
      }

      setNeedsRegistration(false);
      await persistSession(data.data.token, userData, data.data.expiresAt);
      scheduleExpiry(data.data.expiresAt);
      return { success: true, isNewUser: false };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Network error';
      console.error('verifyOtp error:', err.response?.status, err.response?.data);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      apiClient.setToken(token);
      const response = await apiClient.post('/auth/update-profile', { firstName, lastName });
      const data = response.data;

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }

      const updatedUser = data.data as AuthUser;
      setUser(updatedUser);
      setNeedsRegistration(false);

      // Re-persist with updated user data
      const sessionStr = await AppStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        await persistSession(token, updatedUser, session.expiresAt);
        scheduleExpiry(session.expiresAt);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    console.log('[AUTH] logout() called');
    console.log('[AUTH] Current token:', token ? 'EXISTS' : 'NULL');
    console.log('[AUTH] Current user:', user ? user.id : 'NULL');
    try {
      // Clear local session immediately for responsive UI
      console.log('[AUTH] Clearing API token...');
      apiClient.clearToken();
      console.log('[AUTH] API token cleared');
      
      console.log('[AUTH] Clearing local session...');
      await clearSession();
      console.log('[AUTH] Local session cleared');

      // Call backend logout endpoint in background (non-blocking)
      if (token) {
        console.log('[AUTH] Sending backend logout request...');
        setTimeout(() => {
          apiClient.post('/auth/logout', {})
            .then(() => console.log('[AUTH] Backend logout successful'))
            .catch((error) => {
              console.error('[AUTH] Backend logout error:', error);
            });
        }, 100);
      } else {
        console.log('[AUTH] No token available, skipping backend logout');
      }
      console.log('[AUTH] logout() completed successfully');
    } catch (error) {
      console.error('[AUTH] logout() error:', error);
      // Still try to clear session even if there's an error
      console.log('[AUTH] Attempting emergency clear...');
      apiClient.clearToken();
      await clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        needsRegistration,
        sendOtp,
        verifyOtp,
        updateProfile,
        logout,
        setNeedsRegistration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
