import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from './lib/theme';

export default function AboutScreen() {
  const infoItems = [
    { icon: 'information-circle' as const, label: 'App Version', value: '1.0.0' },
    { icon: 'build' as const, label: 'Build Number', value: '2026.03.08' },
    { icon: 'shield-checkmark' as const, label: 'Security', value: 'SSL Encrypted' },
    { icon: 'server' as const, label: 'API Version', value: 'v2.1' },
  ];

  const legalItems = [
    {
      icon: 'document-text' as const,
      label: 'Terms of Service',
      action: () => Alert.alert('Terms of Service', 'Terms of Service content would be displayed here.'),
    },
    {
      icon: 'lock-closed' as const,
      label: 'Privacy Policy',
      action: () => Alert.alert('Privacy Policy', 'Privacy Policy content would be displayed here.'),
    },
    {
      icon: 'help-circle' as const,
      label: 'Help & Support',
      action: () => Alert.alert('Help & Support', 'Contact us at support@fintechapp.co.za'),
    },
    {
      icon: 'star' as const,
      label: 'Rate this App',
      action: () => Alert.alert('Rate Us', 'Thank you for using our app! Rating feature coming soon.'),
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* App Logo / Icon */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Ionicons name="wallet" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.appName}>FinTech Super App</Text>
        <Text style={styles.appTagline}>Your all-in-one mobile financial companion</Text>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        {infoItems.map((item, i) => (
          <View key={i} style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>{item.label}</Text>
            </View>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Support</Text>
        {legalItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.legalRow}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={styles.infoLeft}>
              <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              <Text style={styles.legalLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.neutral} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.copyright}>
        {'\u00A9'} 2026 FinTech Super App. All rights reserved.
      </Text>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 13,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: 6,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: SPACING.sm,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: 6,
  },
  legalLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: SPACING.sm,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.neutral,
    marginTop: SPACING.lg,
  },
});
