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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  route?: string;
  color: string;
  action?: () => void;
}

export default function MenuScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const displayName = user?.fullName?.trim() || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const displayPhone = user?.phone || '';

  const menuItems: MenuItem[] = [
    {
      icon: 'card',
      label: 'Payment Details',
      subtitle: 'Manage your payment cards',
      route: '/card-details',
      color: '#2196F3',
    },
    {
      icon: 'cellular',
      label: 'SIM Management',
      subtitle: 'Manage linked SIMs',
      route: '/sim-management',
      color: '#FF9800',
    },
    {
      icon: 'sparkles',
      label: 'Lifestyle',
      subtitle: 'Entertainment, transport & more',
      route: '/lifestyle',
      color: '#9C27B0',
    },
    {
      icon: 'information-circle',
      label: 'About',
      subtitle: 'App information',
      route: '/about',
      color: '#00BCD4',
    },
  ];

  const handleLogout = () => {
    console.log('[LOGOUT] Logout button clicked');
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    console.log('[LOGOUT] Logout confirmed, setting loading state...');
    setIsLoggingOut(true);
    try {
      console.log('[LOGOUT] Calling logout function...');
      await logout();
      console.log('[LOGOUT] Logout completed successfully');
      console.log('[LOGOUT] Attempting navigation to /auth/login...');
      setShowLogoutModal(false);
      // Navigate to login after logout
      router.replace('/auth/login');
      console.log('[LOGOUT] Navigation triggered');
    } catch (error) {
      console.error('[LOGOUT] Logout error caught:', error);
      console.log('[LOGOUT] Resetting loading state to false');
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      Alert.alert('Error', `Failed to log out: ${error}. Please try again.`);
    }
  };

  const cancelLogout = () => {
    console.log('[LOGOUT] Logout cancelled');
    setShowLogoutModal(false);
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.action) {
      item.action();
    } else {
      Alert.alert(item.label, `Opening ${item.label}...`);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={COLORS.white} />
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.mediumGray} />
              <Text style={styles.profilePhone}>{displayPhone}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
          <Text style={styles.verifiedText}>Phone verified</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.neutral} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]} 
          onPress={handleLogout} 
          disabled={isLoggingOut}
          activeOpacity={0.7}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color={COLORS.accent} />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutConfirmButton, isLoggingOut && styles.logoutConfirmButtonDisabled]}
                onPress={performLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Log Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 20,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhone: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginLeft: 4,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  menuSection: {
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  logoutBtnDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.neutral,
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.neutral,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutConfirmButton: {
    backgroundColor: COLORS.accent,
  },
  logoutConfirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
