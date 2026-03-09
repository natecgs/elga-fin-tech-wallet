import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  textColor: string;
}

const BANNERS: PromoBanner[] = [
  {
    id: '1',
    title: 'Earn Free Data',
    subtitle: 'Complete tasks and earn free mobile data rewards!',
    icon: 'gift-outline',
    bgColor: COLORS.primary,
    textColor: COLORS.white,
  },
  {
    id: '2',
    title: 'Have Fun!',
    subtitle: 'Explore games, music, and entertainment on the go!',
    icon: 'game-controller-outline',
    bgColor: COLORS.accent,
    textColor: COLORS.white,
  },
  {
    id: '3',
    title: 'Refer & Earn',
    subtitle: 'Invite friends and get R10 airtime for each referral!',
    icon: 'people-outline',
    bgColor: '#7B2D8E',
    textColor: COLORS.white,
  },
];

export default function PromoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * CARD_WIDTH, animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < BANNERS.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Headlines & Updates</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: 0 }}
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.card, { backgroundColor: banner.bgColor, width: CARD_WIDTH }]}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              <View style={styles.textWrap}>
                <Text style={[styles.cardTitle, { color: banner.textColor }]}>
                  {banner.title}
                </Text>
                <Text style={[styles.cardSubtitle, { color: banner.textColor + 'CC' }]}>
                  {banner.subtitle}
                </Text>
              </View>
              <View style={styles.iconWrap}>
                <Ionicons name={banner.icon} size={48} color={banner.textColor + '80'} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeIndex ? COLORS.primary : COLORS.neutral },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: 0,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrap: {
    flex: 1,
    marginRight: SPACING.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
});
