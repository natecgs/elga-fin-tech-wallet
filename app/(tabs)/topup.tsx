import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../lib/theme';
import { BALANCES } from '../lib/userData';

interface TopUpOption {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  description: string;
}

const TOP_UP_OPTIONS: TopUpOption[] = [
  { icon: 'cellular', label: 'Data', color: '#2196F3', bg: '#E3F2FD', description: 'Purchase data bundles' },
  { icon: 'call', label: 'Voice', color: '#FF9800', bg: '#FFF3E0', description: 'Buy voice bundles' },
  { icon: 'layers', label: 'Combos', color: '#9C27B0', bg: '#F3E5F5', description: 'Data + Voice + SMS combos' },
  { icon: 'swap-horizontal', label: 'Transfer', color: '#00BCD4', bg: '#E0F7FA', description: 'Transfer to another user' },
  { icon: 'phone-portrait', label: 'Airtime', color: COLORS.primary, bg: COLORS.primaryLight, description: 'Recharge airtime' },
  { icon: 'chatbubble', label: 'SMS', color: '#E91E63', bg: '#FCE4EC', description: 'Buy SMS bundles' },
  { icon: 'ticket', label: 'Voucher', color: '#607D8B', bg: '#ECEFF1', description: 'Redeem voucher PIN' },
];

export default function TopUpScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<TopUpOption | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [voucherPin, setVoucherPin] = useState('');
  const [transferNumber, setTransferNumber] = useState('');

  const handleOptionPress = (option: TopUpOption) => {
    setSelectedOption(option);
    setModalVisible(true);
  };

  const handlePurchase = () => {
    if (selectedOption?.label === 'Voucher' && !voucherPin) {
      Alert.alert('Error', 'Please enter a voucher PIN');
      return;
    }
    if (selectedOption?.label === 'Transfer' && !transferNumber) {
      Alert.alert('Error', 'Please enter the recipient MSISDN');
      return;
    }
    Alert.alert(
      'Success',
      `${selectedOption?.label} purchase initiated successfully!`,
      [{ text: 'OK', onPress: () => setModalVisible(false) }]
    );
    setVoucherPin('');
    setTransferNumber('');
  };

  const miniDashboard = [
    { icon: 'phone-portrait' as const, label: 'Airtime', value: BALANCES.airtime, color: COLORS.primary },
    { icon: 'time' as const, label: 'Minutes', value: BALANCES.minutes, color: '#FF9800' },
    { icon: 'cellular' as const, label: 'Data', value: BALANCES.data, color: '#2196F3' },
    { icon: 'chatbubble' as const, label: 'SMS', value: BALANCES.sms, color: '#9C27B0' },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top Up</Text>
        <Text style={styles.headerSubtitle}>Recharge your account</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mini Dashboard */}
        <View style={styles.miniDashboard}>
          {miniDashboard.map((item, index) => (
            <View key={index} style={styles.miniCard}>
              <Ionicons name={item.icon} size={18} color={item.color} />
              <Text style={styles.miniValue}>{item.value}</Text>
              <Text style={styles.miniLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* TopUp Actions */}
        <Text style={styles.sectionTitle}>Select Top Up Type</Text>
        <View style={styles.optionsGrid}>
          {TOP_UP_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.bg }]}>
                <Ionicons name={option.icon} size={28} color={option.color} />
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDesc} numberOfLines={2}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Bundles */}
        <Text style={styles.sectionTitle}>Popular Bundles</Text>
        {[
          { name: '1GB Data - 30 Days', price: 'R99', type: 'Data' },
          { name: '2GB Data - 30 Days', price: 'R149', type: 'Data' },
          { name: '60 Min All-Net', price: 'R49', type: 'Voice' },
          { name: 'Combo: 500MB + 30 Min + 20 SMS', price: 'R79', type: 'Combo' },
          { name: '100 SMS Bundle', price: 'R29', type: 'SMS' },
        ].map((bundle, i) => (
          <TouchableOpacity
            key={i}
            style={styles.bundleRow}
            onPress={() => Alert.alert('Purchase', `Buy ${bundle.name} for ${bundle.price}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Buy', onPress: () => Alert.alert('Success', `${bundle.name} purchased!`) },
            ])}
            activeOpacity={0.7}
          >
            <View style={styles.bundleInfo}>
              <Text style={styles.bundleName}>{bundle.name}</Text>
              <View style={styles.bundleTag}>
                <Text style={styles.bundleTagText}>{bundle.type}</Text>
              </View>
            </View>
            <View style={styles.bundlePriceWrap}>
              <Text style={styles.bundlePrice}>{bundle.price}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedOption?.label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>{selectedOption?.description}</Text>

            {selectedOption?.label === 'Voucher' && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Voucher PIN</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter voucher PIN"
                  value={voucherPin}
                  onChangeText={setVoucherPin}
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.neutral}
                />
              </View>
            )}

            {selectedOption?.label === 'Transfer' && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Recipient MSISDN</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={transferNumber}
                  onChangeText={setTransferNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.neutral}
                />
              </View>
            )}

            {selectedOption?.label !== 'Voucher' && selectedOption?.label !== 'Transfer' && (
              <View style={styles.bundleOptions}>
                {['Small', 'Medium', 'Large'].map((size, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.bundleOption}
                    onPress={() => {
                      Alert.alert('Success', `${size} ${selectedOption?.label} bundle purchased!`);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.bundleOptionLabel}>{size}</Text>
                    <Text style={styles.bundleOptionPrice}>R{(i + 1) * 29}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase}>
              <Text style={styles.purchaseBtnText}>
                {selectedOption?.label === 'Voucher' ? 'Redeem' : 'Purchase'}
              </Text>
            </TouchableOpacity>
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
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  miniDashboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  miniCard: {
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
  miniValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: 4,
  },
  miniLabel: {
    fontSize: 10,
    color: COLORS.mediumGray,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  optionCard: {
    width: '31%',
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
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 9,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 12,
  },
  bundleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  bundleInfo: {
    flex: 1,
  },
  bundleName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  bundleTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  bundleTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bundlePriceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bundlePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkGray,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: SPACING.md,
  },
  inputWrap: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  bundleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  bundleOption: {
    width: '30%',
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bundleOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  bundleOptionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  purchaseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  purchaseBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
