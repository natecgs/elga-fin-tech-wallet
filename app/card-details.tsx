import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from './lib/theme';
import { useAuth } from './lib/AuthContext';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear + i);

export default function CardDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingPhone, setBillingPhone] = useState(user?.phone || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const validateName = (name: string): boolean => {
    return /^[a-zA-Z\s]{2,50}$/.test(name);
  };

  const luhnCheck = (num: string): boolean => {
    const digits = num.replace(/\s/g, '');
    if (digits.length !== 16 || !/^\d+$/.test(digits)) return false;
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateName(cardholderName)) {
      newErrors.cardholderName = 'Letters only, 2-50 characters';
    }

    const cleanedNumber = cardNumber.replace(/\s/g, '');
    if (cleanedNumber.length !== 16) {
      newErrors.cardNumber = 'Must be 16 digits';
    } else if (!luhnCheck(cleanedNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!expiryMonth) {
      newErrors.expiryMonth = 'Select a month';
    }

    if (!expiryYear) {
      newErrors.expiryYear = 'Select a year';
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = '3 or 4 digits required';
    }

    if (billingPhone && !/^\d{10,12}$/.test(billingPhone.replace(/\D/g, ''))) {
      newErrors.billingPhone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      Alert.alert(
        'Card Saved',
        'Your payment card has been saved successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <View style={styles.cardPreviewTop}>
            <Ionicons name="card" size={28} color={COLORS.white} />
            <Ionicons name="wifi" size={20} color={COLORS.white + '80'} />
          </View>
          <Text style={styles.cardPreviewNumber}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cardPreviewBottom}>
            <View>
              <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
              <Text style={styles.cardPreviewValue}>
                {cardholderName || 'YOUR NAME'}
              </Text>
            </View>
            <View>
              <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
              <Text style={styles.cardPreviewValue}>
                {expiryMonth ? `${String(MONTHS.indexOf(expiryMonth) + 1).padStart(2, '0')}` : 'MM'}/
                {expiryYear ? String(expiryYear).slice(-2) : 'YY'}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Cardholder Name */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Cardholder Name *</Text>
            <TextInput
              style={[styles.input, errors.cardholderName && styles.inputError]}
              placeholder="Name printed on card"
              value={cardholderName}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
                setCardholderName(cleaned);
                if (errors.cardholderName) {
                  setErrors((prev) => ({ ...prev, cardholderName: '' }));
                }
              }}
              placeholderTextColor={COLORS.neutral}
              autoCapitalize="words"
            />
            {errors.cardholderName ? (
              <Text style={styles.errorText}>{errors.cardholderName}</Text>
            ) : null}
          </View>

          {/* Card Number */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Card Number *</Text>
            <View style={[styles.inputRow, errors.cardNumber && styles.inputError]}>
              <Ionicons name="card-outline" size={20} color={COLORS.mediumGray} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.inputFlex}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => {
                  const formatted = formatCardNumber(text);
                  setCardNumber(formatted);
                  if (errors.cardNumber) {
                    setErrors((prev) => ({ ...prev, cardNumber: '' }));
                  }
                }}
                keyboardType="number-pad"
                maxLength={19}
                placeholderTextColor={COLORS.neutral}
              />
            </View>
            {errors.cardNumber ? (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            ) : null}
          </View>

          {/* Expiry Row */}
          <View style={styles.row}>
            <View style={[styles.fieldWrap, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Expiry Month *</Text>
              <TouchableOpacity
                style={[styles.dropdown, errors.expiryMonth && styles.inputError]}
                onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
              >
                <Text style={[styles.dropdownText, !expiryMonth && { color: COLORS.neutral }]}>
                  {expiryMonth || 'Select month'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.mediumGray} />
              </TouchableOpacity>
              {errors.expiryMonth ? (
                <Text style={styles.errorText}>{errors.expiryMonth}</Text>
              ) : null}
              {showMonthPicker && (
                <View style={styles.pickerList}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {MONTHS.map((month, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.pickerItem}
                        onPress={() => {
                          setExpiryMonth(month);
                          setShowMonthPicker(false);
                          if (errors.expiryMonth) setErrors((prev) => ({ ...prev, expiryMonth: '' }));
                        }}
                      >
                        <Text style={[styles.pickerItemText, expiryMonth === month && { color: COLORS.primary, fontWeight: '700' }]}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={[styles.fieldWrap, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Expiry Year *</Text>
              <TouchableOpacity
                style={[styles.dropdown, errors.expiryYear && styles.inputError]}
                onPress={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
              >
                <Text style={[styles.dropdownText, !expiryYear && { color: COLORS.neutral }]}>
                  {expiryYear || 'Select year'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.mediumGray} />
              </TouchableOpacity>
              {errors.expiryYear ? (
                <Text style={styles.errorText}>{errors.expiryYear}</Text>
              ) : null}
              {showYearPicker && (
                <View style={styles.pickerList}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {YEARS.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={styles.pickerItem}
                        onPress={() => {
                          setExpiryYear(String(year));
                          setShowYearPicker(false);
                          if (errors.expiryYear) setErrors((prev) => ({ ...prev, expiryYear: '' }));
                        }}
                      >
                        <Text style={[styles.pickerItemText, expiryYear === String(year) && { color: COLORS.primary, fontWeight: '700' }]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* CVV */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>CVV *</Text>
            <View style={[styles.inputRow, errors.cvv && styles.inputError, { width: 140 }]}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.mediumGray} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.inputFlex}
                placeholder="•••"
                value={cvv}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '').slice(0, 4);
                  setCvv(cleaned);
                  if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: '' }));
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholderTextColor={COLORS.neutral}
              />
            </View>
            {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
          </View>

          {/* Billing Phone */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Billing Phone (Optional)</Text>
            <View style={[styles.inputRow, errors.billingPhone && styles.inputError]}>
              <Ionicons name="call-outline" size={18} color={COLORS.mediumGray} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.inputFlex}
                placeholder="Phone number"
                value={billingPhone}
                onChangeText={(text) => {
                  setBillingPhone(text);
                  if (errors.billingPhone) setErrors((prev) => ({ ...prev, billingPhone: '' }));
                }}
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.neutral}
              />
            </View>
            {billingPhone === user?.phone && (
              <Text style={styles.autoFillHint}>Auto-filled from your profile</Text>
            )}
            {errors.billingPhone ? <Text style={styles.errorText}>{errors.billingPhone}</Text> : null}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.saveBtnText}>Save Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  cardPreview: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  cardPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardPreviewNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewLabel: {
    fontSize: 9,
    color: COLORS.white + '80',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardPreviewValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  form: {},
  fieldWrap: {
    marginBottom: SPACING.md,
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 14,
    fontSize: 15,
    color: COLORS.darkGray,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.accent,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 2,
    backgroundColor: COLORS.white,
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGray,
    paddingVertical: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 14,
    backgroundColor: COLORS.white,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.darkGray,
  },
  pickerList: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
  },
  pickerItemText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  row: {
    flexDirection: 'row',
    zIndex: 10,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.accent,
    marginTop: 4,
    fontWeight: '500',
  },
  autoFillHint: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  buttonRow: {
    marginTop: SPACING.lg,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  cancelBtn: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
});
