import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../lib/theme';

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor?: string;
  bgColor?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function ActionButton({
  icon,
  label,
  iconColor,
  bgColor,
  onPress,
  size = 'medium',
}: ActionButtonProps) {
  const iconSize = size === 'small' ? 20 : size === 'large' ? 30 : 24;
  const wrapSize = size === 'small' ? 40 : size === 'large' ? 56 : 48;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: bgColor || COLORS.primaryLight,
            width: wrapSize,
            height: wrapSize,
            borderRadius: wrapSize / 2,
          },
        ]}
      >
        <Ionicons name={icon} size={iconSize} color={iconColor || COLORS.primary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginBottom: SPACING.md,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
});
