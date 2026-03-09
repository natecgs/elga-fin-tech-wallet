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
import { COLORS, RADIUS, SPACING } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';

export default function RegisterScreen() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (firstName.trim().length < 2) {
      setError('First name must be at least 2 characters');
      return false;
    }
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters');
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
      setError('First name can only contain letters');
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
      setError('Last name can only contain letters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    const result = await updateProfile(firstName.trim(), lastName.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to save profile');
    }
    // On success, AuthContext will update state and trigger navigation
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
        {/* Progress indicator */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Almost there!</Text>
        </View>

        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Welcome illustration */}
          <View style={styles.illustrationWrap}>
            <View style={styles.illustrationCircle}>
              <Ionicons name="person-add" size={36} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.formTitle}>Complete Your Profile</Text>
          <Text style={styles.formSubtitle}>
            Tell us your name so we can personalise your experience
          </Text>

          {/* Phone display */}
          <View style={styles.phoneDisplay}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            <Text style={styles.phoneDisplayText}>
              Verified: +{user?.phone || ''}
            </Text>
          </View>

          {/* First Name */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={COLORS.mediumGray} />
              <TextInput
                style={styles.input}
                placeholder="e.g. George"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text.replace(/[^a-zA-Z\s'-]/g, ''));
                  setError('');
                }}
                placeholderTextColor={COLORS.neutral}
                autoCapitalize="words"
                autoFocus
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={COLORS.mediumGray} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Sambara"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text.replace(/[^a-zA-Z\s'-]/g, ''));
                  setError('');
                }}
                placeholderTextColor={COLORS.neutral}
                autoCapitalize="words"
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorWrap}>
              <Ionicons name="alert-circle" size={16} color={COLORS.accent} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
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
  progressWrap: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  progressBar: {
    width: '60%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    width: '80%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
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
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  illustrationCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  phoneDisplayText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  fieldWrap: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '500',
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
    marginTop: SPACING.sm,
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
});
