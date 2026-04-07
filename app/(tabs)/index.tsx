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
import { getGreeting, getLastUpdated } from '../lib/userData';
import { useAuth } from '../lib/AuthContext';
import apiClient from '../lib/api';
import BalanceWidget from '../components/BalanceWidget';
import ActionButton from '../components/ActionButton';
import PromoCarousel from '../components/PromoCarousel';
import SectionHeader from '../components/SectionHeader';

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState({
    airtime: 'R0.00',
    data: '0 MB',
    minutes: '0 min',
    sms: '0 SMS',
    wallet: 'R0.00',
  });
  const [lastUpdated, setLastUpdated] = useState(getLastUpdated());

  const displayFirstName = user?.firstName || 'User';
  const displayLastName = user?.lastName || '';

  // Fetch balances on mount and when token changes
  useEffect(() => {
    if (token && user) {
      fetchBalances();
    }
  }, [token, user]);

  const fetchBalances = async () => {
    try {
      if (token) {
        apiClient.setToken(token);
      }
      const response = await apiClient.get('/wallet/balances');
      if (response.data.success) {
        setBalances(response.data.data);
        setLastUpdated('Updated just now');
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBalances().finally(() => {
      setRefreshing(false);
    });
  }, [token]);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingWrap}>
            <View style={styles.avatarWrap}>
              <Ionicons name="person" size={22} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{displayFirstName} {displayLastName}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Balance Widgets */}
        <View style={styles.section}>
          <View style={styles.balanceHeader}>
            <Text style={styles.sectionTitle}>My Balances</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.refreshText}>{lastUpdated}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.balanceGrid}>
            <BalanceWidget
              icon="call-outline"
              iconColor={COLORS.primary}
              label="Airtime"
              value={balances.airtime}
              onPress={() => showAlert('Airtime', `Your airtime balance is ${balances.airtime}`)}
            />
            <BalanceWidget
              icon="cellular-outline"
              iconColor="#2196F3"
              label="Data"
              value={balances.data}
              onPress={() => showAlert('Data', `Your data balance is ${balances.data}`)}
            />
            <BalanceWidget
              icon="time-outline"
              iconColor="#FF9800"
              label="Minutes"
              value={balances.minutes}
              onPress={() => showAlert('Minutes', `Your minutes balance is ${balances.minutes}`)}
            />
            <BalanceWidget
              icon="chatbubble-outline"
              iconColor="#9C27B0"
              label="SMS"
              value={balances.sms}
              onPress={() => showAlert('SMS', `Your SMS balance is ${balances.sms}`)}
            />
            <BalanceWidget
              icon="wallet-outline"
              iconColor={COLORS.accent}
              label="MyWallet"
              value={balances.wallet}
              onPress={() => router.push('/(tabs)/wallet')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <ActionButton
            icon="arrow-up-circle"
            label="Buy Data"
            iconColor="#2196F3"
            bgColor="#E3F2FD"
            onPress={() => router.push('/(tabs)/topup')}
          />
          <ActionButton
            icon="logo-usd"
            label="Buy Airtime"
            iconColor={COLORS.primary}
            bgColor={COLORS.primaryLight}
            onPress={() => router.push('/(tabs)/topup')}
          />
          <ActionButton
            icon="call"
            label="Buy Voice"
            iconColor="#FF9800"
            bgColor="#FFF3E0"
            onPress={() => router.push('/(tabs)/topup')}
          />
          <ActionButton
            icon="chatbubble-ellipses"
            label="Call Me"
            iconColor="#9C27B0"
            bgColor="#F3E5F5"
            onPress={() =>
              showAlert('Send Please Call Me', 'Enter a number to send a Please Call Me request.')
            }
          />
        </View>

        {/* Promo Carousel */}
        <View style={styles.carouselWrap}>
          <PromoCarousel />
        </View>

        {/* Shortcuts */}
        <SectionHeader title="Shortcuts" />
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() =>
              showAlert('Please Call Me', 'Send a free Please Call Me to any number.')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#E8F5E0' }]}>
              <Ionicons name="chatbox-outline" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.shortcutLabel}>Send Please{'\n'}Call Me</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => showAlert('Chat Support', 'Opening customer support chat...')}
            activeOpacity={0.7}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="chatbubbles-outline" size={22} color="#2196F3" />
            </View>
            <Text style={styles.shortcutLabel}>Chat{'\n'}to us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => router.push('/(tabs)/topup')}
            activeOpacity={0.7}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="swap-horizontal" size={22} color="#FF9800" />
            </View>
            <Text style={styles.shortcutLabel}>Transfer{'\n'}Airtime</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => router.push('/lifestyle')}
            activeOpacity={0.7}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="game-controller-outline" size={22} color="#9C27B0" />
            </View>
            <Text style={styles.shortcutLabel}>Play &{'\n'}Win</Text>
          </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '400',
  },
  userName: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '700',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  section: {
    paddingHorizontal: SPACING.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 11,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  carouselWrap: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  shortcutCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  shortcutLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },
});
