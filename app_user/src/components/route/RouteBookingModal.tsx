// 1. IMPORTS
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppBottomSheet } from 'components/modal/AppBottomSheet';
import { VehicleType, VehicleTypeItem } from 'components/route/VehicleTypeItem';
import { AppText } from 'components/text/AppText';
import { getString } from 'localization/index';
import React, { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface IProps {
  vehicles: VehicleType[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onBook: () => void;
  onDismiss?: () => void;
  loading?: boolean;
}

// 3. COMPONENT FUNCTION
export const RouteBookingModal = forwardRef<BottomSheetModal, IProps>((props: IProps, ref: ForwardedRef<BottomSheetModal>) => {
  const { vehicles, selectedVehicleId, onSelectVehicle, onBook, onDismiss, loading = false } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

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
            <AppText style={styles.paymentIcon}>💵</AppText>
            <AppText style={styles.paymentText}>
              {getString('bookingPaymentCash')}
            </AppText>
            <TouchableOpacity style={styles.paymentSettings} activeOpacity={0.8}>
              <AppText style={styles.paymentSettingsText}>...</AppText>
            </TouchableOpacity>
          </View>
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
});

// 5. EXPORT
export default RouteBookingModal;
