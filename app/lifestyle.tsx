import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from './lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LifestyleScreen() {
  const router = useRouter();
  const [activeCarousel, setActiveCarousel] = useState(0);
  const [contributionAmount, setContributionAmount] = useState('');
  const carouselRef = useRef<ScrollView>(null);

  const banners = [
    {
      title: 'Earn Free Data',
      subtitle: 'Complete tasks and earn free mobile data!',
      icon: 'gift' as const,
      bg: COLORS.primary,
    },
    {
      title: 'Have Fun!',
      subtitle: 'Explore games, music, and entertainment!',
      icon: 'game-controller' as const,
      bg: COLORS.accent,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeCarousel + 1) % banners.length;
      setActiveCarousel(next);
      carouselRef.current?.scrollTo({ x: next * (SCREEN_WIDTH - 32), animated: true });
    }, 5000);
    return () => clearInterval(timer);
  }, [activeCarousel]);

  const entertainmentItems = [
    {
      icon: 'game-controller' as const,
      label: 'Games',
      color: '#FF5722',
      bg: '#FBE9E7',
      action: () => Alert.alert('Games', 'Opening games library...'),
    },
    {
      icon: 'tv' as const,
      label: 'SUPAViewTV',
      color: '#2196F3',
      bg: '#E3F2FD',
      action: () => Alert.alert('SUPAViewTV', 'Launching streaming service...'),
    },
  ];

  const transportItems = [
    {
      icon: 'car' as const,
      label: 'E-Hailing',
      subtitle: 'Bolt',
      color: '#4CAF50',
      bg: '#E8F5E9',
      action: () => {
        Linking.openURL('https://bolt.eu').catch(() =>
          Alert.alert('E-Hailing', 'Opening Bolt ride service...')
        );
      },
    },
    {
      icon: 'bus' as const,
      label: 'School Rides',
      subtitle: 'For learners',
      color: '#FF9800',
      bg: '#FFF3E0',
      action: () => Alert.alert('School Rides', 'Book transport for learners'),
    },
  ];

  const handleStockvelSubmit = () => {
    if (!contributionAmount || isNaN(Number(contributionAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    Alert.alert(
      'Stockvel Payment',
      `Submit R${contributionAmount} contribution?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            Alert.alert('Success', `R${contributionAmount} contribution submitted!`);
            setContributionAmount('');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Promo Banners */}
      <View style={styles.carouselWrap}>
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH - 32}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
            setActiveCarousel(idx);
          }}
        >
          {banners.map((b, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.banner, { backgroundColor: b.bg, width: SCREEN_WIDTH - 32 }]}
              activeOpacity={0.9}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                </View>
                <View style={styles.bannerIconWrap}>
                  <Ionicons name={b.icon} size={40} color="rgba(255,255,255,0.6)" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === activeCarousel ? COLORS.primary : COLORS.neutral }]}
            />
          ))}
        </View>
      </View>

      {/* Entertainment */}
      <Text style={styles.sectionTitle}>Entertainment</Text>
      <View style={styles.gridRow}>
        {entertainmentItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.serviceCard}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.serviceLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Games Grid */}
      <Text style={styles.sectionTitle}>Popular Games</Text>
      <View style={styles.gamesGrid}>
        {[
          { name: 'Puzzle Quest', icon: 'extension-puzzle' as const, color: '#E91E63' },
          { name: 'Speed Race', icon: 'speedometer' as const, color: '#FF5722' },
          { name: 'Trivia Time', icon: 'help-circle' as const, color: '#9C27B0' },
          { name: 'Card Match', icon: 'layers' as const, color: '#2196F3' },
          { name: 'Word Hunt', icon: 'text' as const, color: '#4CAF50' },
          { name: 'Spin & Win', icon: 'sync' as const, color: '#FF9800' },
        ].map((game, i) => (
          <TouchableOpacity
            key={i}
            style={styles.gameCard}
            onPress={() => Alert.alert(game.name, `Launching ${game.name}...`)}
            activeOpacity={0.7}
          >
            <View style={[styles.gameIcon, { backgroundColor: game.color + '15' }]}>
              <Ionicons name={game.icon} size={24} color={game.color} />
            </View>
            <Text style={styles.gameName} numberOfLines={1}>{game.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transport */}
      <Text style={styles.sectionTitle}>Transport</Text>
      <View style={styles.gridRow}>
        {transportItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.transportCard}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={[styles.transportIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <View>
              <Text style={styles.transportLabel}>{item.label}</Text>
              <Text style={styles.transportSub}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Insurance */}
      <Text style={styles.sectionTitle}>Insurance</Text>
      <TouchableOpacity
        style={styles.insuranceCard}
        onPress={() => {
          Linking.openURL('https://esurity.co.za/about/').catch(() =>
            Alert.alert('Insurance', 'Opening insurance page...')
          );
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.insuranceIcon, { backgroundColor: '#E8EAF6' }]}>
          <Ionicons name="shield-checkmark" size={28} color="#3F51B5" />
        </View>
        <View style={styles.insuranceInfo}>
          <Text style={styles.insuranceTitle}>Get Insured</Text>
          <Text style={styles.insuranceSub}>Protect yourself with affordable insurance</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.neutral} />
      </TouchableOpacity>

      {/* Community - Stockvel */}
      <Text style={styles.sectionTitle}>Community</Text>
      <View style={styles.stockvelCard}>
        <View style={styles.stockvelHeader}>
          <View style={[styles.stockvelIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="people" size={24} color="#FF9800" />
          </View>
          <View style={styles.stockvelInfo}>
            <Text style={styles.stockvelTitle}>Stockvel</Text>
            <Text style={styles.stockvelSub}>Community savings group</Text>
          </View>
        </View>
        <View style={styles.contributionWrap}>
          <Text style={styles.contributionLabel}>Contribution Amount</Text>
          <View style={styles.contributionRow}>
            <View style={styles.currencyWrap}>
              <Text style={styles.currencyText}>R</Text>
            </View>
            <TextInput
              style={styles.contributionInput}
              placeholder="0.00"
              value={contributionAmount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                setContributionAmount(cleaned);
              }}
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.neutral}
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleStockvelSubmit}
            >
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
  carouselWrap: {
    marginBottom: SPACING.lg,
  },
  banner: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 110,
    justifyContent: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    lineHeight: 18,
  },
  bannerIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gameCard: {
    width: '31%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gameIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  gameName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  transportCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  transportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  transportSub: {
    fontSize: 11,
    color: COLORS.mediumGray,
    marginTop: 1,
  },
  insuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insuranceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  insuranceInfo: {
    flex: 1,
  },
  insuranceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  insuranceSub: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  stockvelCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stockvelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stockvelIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  stockvelInfo: {
    flex: 1,
  },
  stockvelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  stockvelSub: {
    fontSize: 12,
    color: COLORS.mediumGray,
  },
  contributionWrap: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  contributionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  contributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyWrap: {
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: RADIUS.sm,
    borderBottomLeftRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 0,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  contributionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
