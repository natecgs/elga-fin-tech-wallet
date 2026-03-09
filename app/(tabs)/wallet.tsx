import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';
import apiClient from '../lib/api';

export default function WalletScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState('R0.00');

  const userPhone = user?.phone || '';

  useEffect(() => {
    if (token && user) {
      fetchWallet();
    }
  }, [token, user]);

  const fetchWallet = async () => {
    try {
      if (token) {
        apiClient.setToken(token);
      }
      const response = await apiClient.get('/wallet/balance');
      if (response.data.success) {
        const balance = response.data.data.balance || 0;
        setWalletBalance(`R${balance.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWallet().finally(() => {
      setRefreshing(false);
    });
  }, [token]);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const walletActions = [
    {
      icon: 'send' as const,
      label: 'Pay Wallet',
      color: COLORS.primary,
      bg: COLORS.primaryLight,
      action: () => showAlert('Pay Wallet', 'Open wallet-to-wallet payment screen'),
    },
    {
      icon: 'cart' as const,
      label: 'Marketplace',
      color: '#2196F3',
      bg: '#E3F2FD',
      action: () => showAlert('Marketplace', 'Opening marketplace module...'),
    },
    {
      icon: 'arrow-up-circle' as const,
      label: 'Deposit',
      color: '#FF9800',
      bg: '#FFF3E0',
      action: () => showAlert('Deposit', 'Open deposit screen to add funds'),
    },
    {
      icon: 'arrow-down-circle' as const,
      label: 'Cash Out',
      color: '#9C27B0',
      bg: '#F3E5F5',
      action: () => showAlert('Cash Out', 'Open withdrawal screen'),
    },
    {
      icon: 'business' as const,
      label: 'Pay to Bank',
      color: '#00BCD4',
      bg: '#E0F7FA',
      action: () => showAlert('Pay to Bank', 'Transfer funds to your bank account'),
    },
    {
      icon: 'document-text' as const,
      label: 'Statement',
      color: '#607D8B',
      bg: '#ECEFF1',
      action: () => showAlert('Statement', 'View your wallet statement'),
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
      >
        {/* Phone Section */}
        <View style={styles.phoneSection}>
          <View style={styles.phoneRow}>
            <View style={styles.phoneLeft}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
              <Text style={styles.phoneNumber}>{userPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.linkCardBtn}
              onPress={() => router.push('/card-details')}
            >
              <Text style={styles.linkCardText}>Link Card</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.proofBtn}
            onPress={() => showAlert('Proof of Account', 'Generating proof of account PDF...')}
          >
            <Ionicons name="document-outline" size={16} color={COLORS.primary} />
            <Text style={styles.proofText}>Proof of Account</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardContent}>
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceLabel}>MyWallet Balance</Text>
              <Text style={styles.balanceAmount}>{walletBalance}</Text>
              <TouchableOpacity style={styles.refreshRow} onPress={onRefresh}>
                <Ionicons name="refresh" size={14} color={COLORS.white + '99'} />
                <Text style={styles.refreshLabel}>Refresh</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.balanceRight}>
              <View style={styles.coinsCircle}>
                <Ionicons name="logo-bitcoin" size={36} color="#FFD700" />
              </View>
            </View>
          </View>
        </View>

        {/* Wallet Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Wallet Actions</Text>
          <View style={styles.actionsGrid}>
            {walletActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {[
            { title: 'Airtime Purchase', amount: '-R5.00', date: 'Today, 10:30 AM', icon: 'call' as const, color: COLORS.accent },
            { title: 'Wallet Deposit', amount: '+R50.00', date: 'Yesterday, 2:15 PM', icon: 'arrow-up-circle' as const, color: COLORS.primary },
            { title: 'Data Bundle', amount: '-R29.00', date: 'Mar 6, 9:00 AM', icon: 'cellular' as const, color: '#2196F3' },
          ].map((tx, i) => (
            <TouchableOpacity key={i} style={styles.txRow} activeOpacity={0.7}>
              <View style={[styles.txIcon, { backgroundColor: tx.color + '15' }]}>
                <Ionicons name={tx.icon} size={20} color={tx.color} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount.startsWith('+') ? COLORS.primary : COLORS.accent }]}>
                {tx.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  phoneSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  phoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: SPACING.sm,
  },
  linkCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  linkCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 2,
  },
  proofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  proofText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  balanceCard: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshLabel: {
    fontSize: 12,
    color: COLORS.white + '99',
    marginLeft: 4,
    fontWeight: '500',
  },
  balanceRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinsCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '30%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: SPACING.md,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  txDate: {
    fontSize: 11,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
