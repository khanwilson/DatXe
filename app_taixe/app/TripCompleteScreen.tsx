// 1. IMPORTS
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from 'components/text/AppText';
import { AppButton } from 'components/button/AppButton';
import { ITheme, useAppTheme } from 'theme/index';
import { getString } from 'localization/index';
import ZustandSession from 'zustand/session';

// 2. VARIABLES & TYPES
const formatPrice = (price: number): string => price.toLocaleString('vi-VN') + 'đ';

// 3. COMPONENT FUNCTION
export default function TripCompleteScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const router = useRouter();

  const params = useLocalSearchParams<{
    fare: string;
    distanceText: string;
    durationText: string;
  }>();

  const fare = params.fare ? Number(params.fare) : 0;
  const distanceText = params.distanceText ?? '';
  const durationText = params.durationText ?? '';

  const handleBackToHome = () => {
    ZustandSession.getState().save('selectedDestination', null);
    ZustandSession.getState().save('selectedPickup', null);
    router.replace('/(tabs)/HomeScreen');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.iconContainer}>
        <AppText style={styles.checkIcon}>✓</AppText>
      </View>

      <AppText style={styles.title}>{getString('tripCompleteTitle')}</AppText>
      <AppText style={styles.subtitle}>{getString('tripCompleteSubtitle')}</AppText>

      <View style={styles.summaryCard}>
        {!!distanceText && (
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>{getString('routeDistanceLabel')}</AppText>
            <AppText style={styles.summaryValue}>{distanceText}</AppText>
          </View>
        )}
        {!!durationText && (
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>{getString('routeDurationLabel')}</AppText>
            <AppText style={styles.summaryValue}>{durationText}</AppText>
          </View>
        )}
        <View style={[styles.summaryRow, styles.fareRow]}>
          <AppText style={styles.fareLabelText}>{getString('tripFareLabel')}</AppText>
          <AppText style={styles.fareValueText}>{formatPrice(fare)}</AppText>
        </View>
      </View>

      <AppButton
        style={styles.homeButton}
        textStyle={styles.homeText}
        text={getString('backToHome')}
        onPress={handleBackToHome}
      />
    </View>
  );
}

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
    paddingHorizontal: theme.dimensions.p24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.color.primary.actionGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.dimensions.p24,
  },
  checkIcon: {
    fontSize: 40,
    color: theme.color.white,
    fontWeight: '700',
  },
  title: {
    fontSize: theme.fontSize.p24,
    fontWeight: '700',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
    marginBottom: theme.dimensions.p32,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: theme.color.background.surface,
    borderRadius: theme.dimensions.p12,
    padding: theme.dimensions.p16,
    marginBottom: theme.dimensions.p32,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.dimensions.p8,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border.light,
  },
  summaryLabel: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
  },
  fareRow: {
    borderBottomWidth: 0,
    marginTop: theme.dimensions.p4,
  },
  fareLabelText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.primary,
  },
  fareValueText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.primary.actionGreen,
  },
  homeButton: {
    width: '100%',
    paddingVertical: theme.dimensions.p16,
    borderRadius: theme.dimensions.p12,
    backgroundColor: theme.color.primary.actionGreen,
    alignItems: 'center',
    marginTop: 'auto',
  },
  homeText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.white,
  },
});
