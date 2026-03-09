import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../lib/theme';

interface BalanceWidgetProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: string;
  onPress?: () => void;
}

export default function BalanceWidget({ icon, iconColor, label, value, onPress }: BalanceWidgetProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: (iconColor || COLORS.primary) + '15' }]}>
        <Ionicons name={icon} size={22} color={iconColor || COLORS.primary} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border + '50',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 2,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
});
