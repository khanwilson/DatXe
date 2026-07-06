// 1. IMPORTS
import { AppButton } from 'components/button/AppButton';
import { RenderImage } from 'components/image/RenderImage';
import { AppText } from 'components/text/AppText';
import { MockDriver, TripStatus } from 'constants/trip';
import { iLocalization } from 'localization/iLocalization';
import { getString } from 'localization/index';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
interface TripSummary {
  fare: number;
  distanceText: string;
  durationText: string;
}

interface IProps {
  status: TripStatus;
  driver: MockDriver;
  vehicleName: string;
  fare: number;
  summary: TripSummary;
  onCancel: () => void;
  onDone: () => void;
}

const formatPrice = (price: number): string => price.toLocaleString('vi-VN') + 'đ';

const STATUS_TITLE: Record<TripStatus, keyof iLocalization> = {
  FINDING: 'tripFinding',
  EN_ROUTE: 'tripEnRoute',
  ARRIVED: 'tripArrived',
  IN_PROGRESS: 'tripInProgress',
  COMPLETED: 'tripCompleted',
};

// 3. COMPONENT FUNCTION
export const TripStatusSheet: React.FC<IProps> = ({
  status,
  driver,
  vehicleName,
  fare,
  summary,
  onCancel,
  onDone,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  const showDriverCard = status === 'EN_ROUTE' || status === 'ARRIVED' || status === 'IN_PROGRESS';
  const canCancel = status === 'FINDING' || status === 'EN_ROUTE' || status === 'ARRIVED';

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <AppText style={styles.statusTitle}>{getString(STATUS_TITLE[status])}</AppText>

      {status === 'FINDING' && (
        <View style={styles.findingRow}>
          <ActivityIndicator color={theme.color.primary.actionGreen} />
          <AppText style={styles.findingText}>{getString('tripFindingHint')}</AppText>
        </View>
      )}

      {showDriverCard && (
        <View style={styles.driverCard}>
          <RenderImage source={driver.avatar} style={styles.avatar} />
          <View style={styles.driverInfo}>
            <AppText style={styles.driverName}>{driver.name}</AppText>
            <AppText style={styles.driverMeta}>
              ⭐ {driver.rating.toFixed(1)} · {driver.vehicleModel}
            </AppText>
            <AppText style={styles.driverPlate}>{driver.plate}</AppText>
          </View>
          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
              <AppText style={styles.contactIcon}>📞</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
              <AppText style={styles.contactIcon}>💬</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showDriverCard && (
        <View style={styles.tripMetaRow}>
          <AppText style={styles.tripMetaLabel}>{vehicleName}</AppText>
          <AppText style={styles.tripMetaValue}>{formatPrice(fare)}</AppText>
        </View>
      )}

      {status === 'COMPLETED' && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>{getString('routeDistanceLabel')}</AppText>
            <AppText style={styles.summaryValue}>{summary.distanceText}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>{getString('routeDurationLabel')}</AppText>
            <AppText style={styles.summaryValue}>{summary.durationText}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabelFare}>{getString('tripFare')}</AppText>
            <AppText style={styles.summaryValueFare}>{formatPrice(summary.fare)}</AppText>
          </View>
        </View>
      )}

      {canCancel && (
        <AppButton
          style={styles.cancelButton}
          textStyle={styles.cancelText}
          text={getString('tripCancel')}
          onPress={onCancel}
        />
      )}

      {status === 'COMPLETED' && (
        <AppButton
          style={styles.doneButton}
          textStyle={styles.doneText}
          text={getString('tripDone')}
          onPress={onDone}
        />
      )}
    </View>
  );
};

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.color.background.surface,
    borderTopLeftRadius: theme.dimensions.p16,
    borderTopRightRadius: theme.dimensions.p16,
    paddingHorizontal: theme.dimensions.p16,
    paddingTop: theme.dimensions.p12,
    paddingBottom: theme.dimensions.p32,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.color.border.default,
    marginBottom: theme.dimensions.p12,
  },
  statusTitle: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p12,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.dimensions.p12,
  },
  findingText: {
    marginLeft: theme.dimensions.p12,
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.dimensions.p12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.color.background.surfaceAlt,
  },
  driverInfo: {
    flex: 1,
    marginLeft: theme.dimensions.p12,
  },
  driverName: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.primary,
  },
  driverMeta: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
    marginTop: 2,
  },
  driverPlate: {
    fontSize: theme.fontSize.p14,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactButton: {
    width: theme.dimensions.p40,
    height: theme.dimensions.p40,
    borderRadius: theme.dimensions.p20,
    backgroundColor: theme.color.background.app,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.dimensions.p8,
  },
  contactIcon: {
    fontSize: theme.fontSize.p16,
  },
  tripMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.dimensions.p12,
    borderTopWidth: 1,
    borderTopColor: theme.color.border.light,
  },
  tripMetaLabel: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
  },
  tripMetaValue: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.primary,
  },
  summaryCard: {
    paddingVertical: theme.dimensions.p8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.dimensions.p8,
  },
  summaryLabel: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
  },
  summaryLabelFare: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.primary,
  },
  summaryValueFare: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.primary.actionGreen,
  },
  cancelButton: {
    marginTop: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p16,
    borderRadius: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.state.error,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.state.error,
  },
  doneButton: {
    marginTop: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p16,
    borderRadius: theme.dimensions.p12,
    backgroundColor: theme.color.primary.actionGreen,
    alignItems: 'center',
  },
  doneText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.white,
  },
});

// 5. EXPORT
export default TripStatusSheet;
