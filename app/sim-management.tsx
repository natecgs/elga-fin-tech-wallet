import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from './lib/theme';

interface SimDetail {
  label: string;
  value: string;
}

const SIM_DETAILS: SimDetail[] = [
  { label: 'SIM Serial Number', value: '8927000007242074111' },
  { label: 'PUK 1', value: '12137318' },
  { label: 'PUK 2', value: '43410866' },
];

export default function SimManagementScreen() {
  const router = useRouter();
  const [porting, setPorting] = useState(false);

  const handlePortMyNumber = () => {
    Alert.alert(
      'Port My Number',
      'Are you sure you want to initiate a number porting request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setPorting(true);
            // Simulate API call
            setTimeout(() => {
              setPorting(false);
              Alert.alert('Request Submitted', 'Your number porting request has been submitted successfully.');
            }, 2000);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIM Card Details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SIM Details Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>SIM Details</Text>

          {SIM_DETAILS.map((detail, index) => (
            <View
              key={detail.label}
              style={[
                styles.detailRow,
                index < SIM_DETAILS.length - 1 && styles.detailRowBorder,
              ]}
            >
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Port My Number Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.portBtn, porting && styles.portBtnDisabled]}
          onPress={handlePortMyNumber}
          disabled={porting}
          activeOpacity={0.8}
        >
          {porting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.portBtnText}>Port My Number</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginRight: SPACING.md,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.mediumGray,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.mediumGray,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  footer: {
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  portBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  portBtnDisabled: {
    opacity: 0.7,
  },
  portBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
