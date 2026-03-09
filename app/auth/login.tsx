import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';

type Step = 'phone' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp, isAuthenticated, needsRegistration } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Navigate to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !needsRegistration) {
      console.log('[LOGIN] User authenticated, navigating to home');
      router.replace('/(tabs)');
    } else if (isAuthenticated && needsRegistration) {
      console.log('[LOGIN] User needs registration, navigating to profile setup');
      // You can redirect to profile completion screen here if needed
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, needsRegistration]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const formatPhoneDisplay = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setError('');
  };

  const validatePhone = (): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    // SA mobile: starts with 0 followed by 6/7/8, total 10 digits
    if (!/^0[6-8]\d{8}$/.test(cleaned)) {
      setError('Enter a valid SA mobile number (e.g. 068 905 3667)');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;

    setLoading(true);
    setError('');

    const result = await sendOtp(phone);

    setLoading(false);

    if (result.success) {
      setDemoOtp(result.demoOtp || '');
      setStep('otp');
      setCountdown(60);
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    console.log('[LOGIN] OTP digit input - index:', index, '-> text:', text);
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 1) {
      // Handle paste
      const chars = cleaned.slice(0, 6).split('');
      const newOtp = [...otp];
      chars.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      console.log('[LOGIN] Paste detected - newOtp array:', newOtp);
      setOtp(newOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      otpRefs.current[nextIndex]?.focus();
      // Auto-verify if all filled
      if (newOtp.every(d => d !== '')) {
        const fullCode = newOtp.join('');
        console.log('[LOGIN] All digits filled via paste, auto-verifying:', fullCode);
        handleVerifyOtp(fullCode);
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    console.log('[LOGIN] Single digit entered - newOtp array:', newOtp);
    setOtp(newOtp);
    setError('');

    if (cleaned && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (cleaned && index === 5) {
      const fullOtp = newOtp.join('');
      console.log('[LOGIN] 6th digit entered, auto-verifying:', fullOtp, '-> length:', fullOtp.length);
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code || otp.join('');
    console.log('[LOGIN] handleVerifyOtp called - code param:', code, '-> OTP array:', otp, '-> Final code:', otpCode, '-> Length:', otpCode.length);
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    const result = await verifyOtp(phone, otpCode);
    console.log('[LOGIN] verifyOtp result:', result);

    if (!result.success) {
      console.log('[LOGIN] Verification failed, resetting state');
      setLoading(false);
      setError(result.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } else {
      console.log('[LOGIN] Verification SUCCESSFUL - navigating to dashboard');
      router.replace('/(tabs)');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) {
      setDemoOtp(result.demoOtp || '');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Branding */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="wallet" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>FinTech</Text>
          <Text style={styles.appTagline}>Your all-in-one mobile wallet</Text>
        </View>

        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {step === 'phone' ? (
            <>
              <Text style={styles.formTitle}>Welcome</Text>
              <Text style={styles.formSubtitle}>
                Enter your South African mobile number to get started
              </Text>

              {/* Phone Input */}
              <View style={styles.phoneInputWrap}>
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇿🇦</Text>
                  <Text style={styles.countryCodeText}>+27</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="068 905 3667"
                  value={formatPhoneDisplay(phone)}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={12}
                  placeholderTextColor={COLORS.neutral}
                  autoFocus
                />
              </View>

              <Text style={styles.phoneHint}>
                We'll send a verification code via SMS
              </Text>

              {error ? (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.accent} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Send Verification Code</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}>
                <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                <Text style={styles.backBtnText}>Change number</Text>
              </TouchableOpacity>

              <Text style={styles.formTitle}>Verify Your Number</Text>
              <Text style={styles.formSubtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.phoneHighlight}>+27 {formatPhoneDisplay(phone.startsWith('0') ? phone.substring(1) : phone)}</Text>
              </Text>

              {/* OTP Input */}
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { otpRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : {},
                      error ? styles.otpInputError : {},
                    ]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    placeholderTextColor={COLORS.neutral}
                  />
                ))}
              </View>

              {/* Demo OTP hint */}
              {demoOtp ? (
                <View style={styles.demoHint}>
                  <Ionicons name="information-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.demoHintText}>
                    Demo OTP: <Text style={styles.demoCode}>{demoOtp}</Text>
                  </Text>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.accent} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={() => handleVerifyOtp()}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

              {/* Resend */}
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendOtp}
                disabled={countdown > 0}
              >
                <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : 'Resend verification code'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backBtnText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    letterSpacing: 1,
  },
  phoneHint: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: SPACING.md,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkGray,
    backgroundColor: COLORS.bgLight,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  otpInputError: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  demoHintText: {
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 6,
  },
  demoCode: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 2,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.accent,
    marginLeft: 6,
    flex: 1,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  resendDisabled: {
    color: COLORS.neutral,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.neutral,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
});
