// 1. IMPORTS
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppBottomSheet } from 'components/modal/AppBottomSheet';
import { VehicleType, VehicleTypeItem } from 'components/route/VehicleTypeItem';
import { AppText } from 'components/text/AppText';
import { getString } from 'localization/index';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
export type PaymentMethod = 'VNPAY' | 'CASH';

interface IProps {
  vehicles: VehicleType[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onBook: () => void;
  onDismiss?: () => void;
  loading?: boolean;
  paymentMethod: PaymentMethod;
  onChangePaymentMethod: (method: PaymentMethod) => void;
  // When true, no driver was found after a paid booking: replace the book
  // button with a continue-search / cancel row.
  awaitingDecision?: boolean;
  onContinue?: () => void;
  onCancel?: () => void;
  // Server-driven decision window (ms). The continue button fills a progress
  // overlay right-to-left over this duration; when full, the BE auto-cancels.
  decisionTimeoutMs?: number;
}

// 3. COMPONENT FUNCTION
export const RouteBookingModal = forwardRef<BottomSheetModal, IProps>((props: IProps, ref: ForwardedRef<BottomSheetModal>) => {
  const { vehicles, selectedVehicleId, onSelectVehicle, onBook, onDismiss, loading = false, paymentMethod, onChangePaymentMethod, awaitingDecision = false, onContinue, onCancel, decisionTimeoutMs } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);

  // Progress overlay on the continue button: a lighter shade anchored to the
  // right edge that grows right-to-left, filling the whole button exactly when
  // decisionTimeoutMs elapses (which is when the BE auto-cancel fires).
  // progress goes 0 -> 1 (width 0% -> 100%).
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!awaitingDecision || !decisionTimeoutMs) return;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: decisionTimeoutMs,
      easing: Easing.linear,
      useNativeDriver: false, // animating width %, not transform
    });
    animation.start();
    return () => animation.stop();
  }, [awaitingDecision, decisionTimeoutMs, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderVehicle = useCallback(({ item }: { item: VehicleType }) => (
    <View style={{height: 82}}>
      <VehicleTypeItem
        vehicle={item}
        selected={item.id === selectedVehicleId}
        onPress={onSelectVehicle}
      />
    </View>
  ), [selectedVehicleId, onSelectVehicle]);

  const keyExtractor = useCallback((item: VehicleType) => item.id, []);

  return (
    <AppBottomSheet
      ref={ref}
      snapPoints={[480]}
      index={1}
      enablePanDownToClose={false}
      onDismiss={onDismiss}
    >
      <View style={styles.container}>
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.flex}
        />
        {/* payment and book button */}
        <View style={styles.stickyBottom}>
          <View style={styles.discountRow}>
            <AppText style={styles.discountIcon}>🎫</AppText>
            <AppText style={styles.discountText}>
              {getString('bookingDiscountCode')}
            </AppText>
            <TouchableOpacity style={styles.discountButton} activeOpacity={0.8}>
              <AppText style={styles.discountButtonText}>+</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentRow}>
            <AppText style={styles.paymentIcon}>{paymentMethod === 'VNPAY' ? '💳' : '💵'}</AppText>
            <AppText style={styles.paymentText}>
              {getString(paymentMethod === 'VNPAY' ? 'bookingPaymentVnpay' : 'bookingPaymentCash')}
            </AppText>
            <TouchableOpacity style={styles.paymentSettings} activeOpacity={0.8} onPress={() => setShowPaymentPicker(true)}>
              <AppText style={styles.paymentSettingsText}>...</AppText>
            </TouchableOpacity>
          </View>
          <Modal visible={showPaymentPicker} transparent animationType="fade" onRequestClose={() => setShowPaymentPicker(false)}>
            <Pressable style={styles.pickerOverlay} onPress={() => setShowPaymentPicker(false)}>
              <View style={styles.pickerSheet}>
                <AppText style={styles.pickerTitle}>{getString('bookingSelectPayment')}</AppText>
                <TouchableOpacity
                  style={[styles.pickerOption, paymentMethod === 'VNPAY' && styles.pickerOptionActive]}
                  onPress={() => { onChangePaymentMethod('VNPAY'); setShowPaymentPicker(false); }}
                  activeOpacity={0.7}
                >
                  <AppText style={styles.pickerOptionIcon}>💳</AppText>
                  <AppText style={styles.pickerOptionText}>{getString('bookingPaymentVnpay')}</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, paymentMethod === 'CASH' && styles.pickerOptionActive]}
                  onPress={() => { onChangePaymentMethod('CASH'); setShowPaymentPicker(false); }}
                  activeOpacity={0.7}
                >
                  <AppText style={styles.pickerOptionIcon}>💵</AppText>
                  <AppText style={styles.pickerOptionText}>{getString('bookingPaymentCash')}</AppText>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
          {awaitingDecision ? (
            <View style={styles.decisionRow}>
              <TouchableOpacity
                style={[styles.decisionButton, styles.continueButton]}
                onPress={onContinue}
                activeOpacity={0.8}
              >
                {decisionTimeoutMs ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.continueProgress, { width: progressWidth }]}
                  />
                ) : null}
                <AppText style={styles.bookButtonText}>
                  {getString('bookingContinueSearch')}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.decisionButton, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <AppText style={styles.bookButtonText}>
                  {getString('bookingCancelTrip')}
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.bookButton, loading && styles.bookButtonDisabled]}
              onPress={onBook}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppText style={styles.bookButtonText}>
                  {getString('bookingBookButton')}
                </AppText>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AppBottomSheet>
  );
});

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.dimensions.p16,
    paddingTop: theme.dimensions.p8,
    paddingBottom: theme.dimensions.p12,
  },
  stickyBottom: {
    height: 180,
    borderTopWidth: 1,
    borderTopColor: theme.color.border.light,
    paddingHorizontal: theme.dimensions.p16,
    paddingTop: theme.dimensions.p12,
    paddingBottom: theme.dimensions.p16,
    // backgroundColor: theme.color.card.bg,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.dimensions.p12,
  },
  discountIcon: {
    fontSize: theme.fontSize.p16,
    marginRight: theme.dimensions.p8,
  },
  discountText: {
    flex: 1,
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
  },
  discountButton: {
    width: theme.dimensions.p32,
    height: theme.dimensions.p32,
    borderRadius: theme.dimensions.p8,
    backgroundColor: theme.color.background.app,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountButtonText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.primary.actionGreen,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.dimensions.p16,
  },
  paymentIcon: {
    fontSize: theme.fontSize.p16,
    marginRight: theme.dimensions.p8,
  },
  paymentText: {
    flex: 1,
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
  },
  paymentSettings: {
    width: theme.dimensions.p32,
    height: theme.dimensions.p32,
    borderRadius: theme.dimensions.p8,
    backgroundColor: theme.color.background.app,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentSettingsText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.secondary,
  },
  bookButton: {
    backgroundColor: theme.color.primary.actionGreen,
    borderRadius: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p16,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: theme.color.button.disabledBg,
  },
  bookButtonText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  decisionRow: {
    flexDirection: 'row',
  },
  decisionButton: {
    flex: 1,
    borderRadius: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p16,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: theme.color.primary.actionGreen,
    marginRight: theme.dimensions.p12,
    overflow: 'hidden', // clip the progress overlay to the rounded corners
    justifyContent: 'center',
  },
  // Lighter shade anchored to the right edge; width animates 0% -> 100% to sweep
  // right-to-left over the decision window.
  continueProgress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cancelButton: {
    backgroundColor: theme.color.state.error,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: theme.color.background.surface,
    borderTopLeftRadius: theme.dimensions.p16,
    borderTopRightRadius: theme.dimensions.p16,
    paddingHorizontal: theme.dimensions.p16,
    paddingTop: theme.dimensions.p16,
    paddingBottom: theme.dimensions.p32,
  },
  pickerTitle: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p12,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p12,
    borderRadius: theme.dimensions.p8,
  },
  pickerOptionActive: {
    backgroundColor: theme.color.background.app,
  },
  pickerOptionIcon: {
    fontSize: theme.fontSize.p16,
    marginRight: theme.dimensions.p12,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
  },
});

// 5. EXPORT
export default RouteBookingModal;
