// 1. IMPORTS
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from 'components/text/AppText';
import { AppButton } from 'components/button/AppButton';
import { ITheme, useAppTheme } from 'theme/index';
import { getString } from 'localization/index';
import { getSocket } from 'api/socket/socketClient';

// 2. VARIABLES & TYPES
// Matches the backend `booking.driver_assigned` payload (nested driver omitted —
// this screen only needs the top-level ids to route to navigation).
interface DriverAssignedPayload {
  tripId: string;
  bookingId: string;
}

const formatPrice = (price: number): string => price.toLocaleString('vi-VN') + 'đ';

// 3. COMPONENT FUNCTION
export default function OfferScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const router = useRouter();

  const params = useLocalSearchParams<{
    offerId: string;
    bookingId: string;
    pickupAddress: string;
    pickupLat: string;
    pickupLng: string;
    destinationAddress: string;
    destinationLat: string;
    destinationLng: string;
    fare: string;
    expiresAt: string;
  }>();

  const offerId = params.offerId ?? '';
  const bookingId = params.bookingId ?? '';
  const pickupAddress = params.pickupAddress ?? '';
  const pickupLat = params.pickupLat ?? '0';
  const pickupLng = params.pickupLng ?? '0';
  const destinationAddress = params.destinationAddress ?? '';
  const destinationLat = params.destinationLat ?? '0';
  const destinationLng = params.destinationLng ?? '0';
  const fare = params.fare ? Number(params.fare) : 0;
  const expiresAt = params.expiresAt ?? '';

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!expiresAt) return 30;
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });
  const [responding, setResponding] = useState(false);
  const responded = useRef(false);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      handleReject();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReject = useCallback(() => {
    if (responded.current) return;
    responded.current = true;
    const socket = getSocket();
    socket.emit('driver.offer_response', { offerId, accepted: false });
    router.replace('/(tabs)/HomeScreen');
  }, [offerId, router]);

  const handleAccept = useCallback(() => {
    if (responded.current || responding) return;
    responded.current = true;
    setResponding(true);

    const socket = getSocket();
    socket.emit('driver.offer_response', { offerId, accepted: true });

    const handleAssigned = (payload: DriverAssignedPayload) => {
      if (payload.bookingId !== bookingId) return;
      socket.off('booking.driver_assigned', handleAssigned);
      router.replace({
        pathname: '/PickupNavigationScreen',
        params: {
          tripId: payload.tripId,
          pickupLat,
          pickupLng,
          pickupAddress,
          destinationLat,
          destinationLng,
          destinationAddress,
          fare: params.fare ?? '0',
        },
      });
    };

    socket.on('booking.driver_assigned', handleAssigned);

    // Fallback: if no driver_assigned within 10s, go back to dashboard
    setTimeout(() => {
      socket.off('booking.driver_assigned', handleAssigned);
      if (responding) {
        router.replace('/(tabs)/HomeScreen');
      }
    }, 10000);
  }, [offerId, bookingId, pickupLat, pickupLng, pickupAddress, destinationLat, destinationLng, destinationAddress, params.fare, responding, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>{getString('offerTitle')}</AppText>
        <View style={[styles.timerBadge, secondsLeft <= 10 && styles.timerUrgent]}>
          <AppText style={[styles.timerText, secondsLeft <= 10 && styles.timerTextUrgent]}>
            {getString('offerExpires')} {secondsLeft}s
          </AppText>
        </View>
      </View>

      {/* Fare */}
      <View style={styles.fareCard}>
        <AppText style={styles.fareLabel}>{getString('offerFare')}</AppText>
        <AppText style={styles.fareValue}>{formatPrice(fare)}</AppText>
      </View>

      {/* Route */}
      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <View style={styles.dotPickup} />
          <View style={styles.routeInfo}>
            <AppText style={styles.routeLabel}>{getString('offerPickup')}</AppText>
            <AppText style={styles.routeAddress}>{pickupAddress}</AppText>
          </View>
        </View>
        <View style={styles.routeDivider} />
        <View style={styles.routeRow}>
          <View style={styles.dotDestination} />
          <View style={styles.routeInfo}>
            <AppText style={styles.routeLabel}>{getString('offerDestination')}</AppText>
            <AppText style={styles.routeAddress}>{destinationAddress}</AppText>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <AppButton
          style={styles.rejectButton}
          textStyle={styles.rejectText}
          text={getString('offerReject')}
          onPress={handleReject}
          disabled={responding}
        />
        <AppButton
          style={styles.acceptButton}
          textStyle={styles.acceptText}
          text={responding ? '...' : getString('offerAccept')}
          onPress={handleAccept}
          disabled={responding}
        />
      </View>
    </View>
  );
}

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
    paddingHorizontal: theme.dimensions.p16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.dimensions.p24,
  },
  title: {
    fontSize: theme.fontSize.p20,
    fontWeight: '700',
    color: theme.color.text.primary,
  },
  timerBadge: {
    backgroundColor: theme.color.background.surface,
    borderRadius: theme.dimensions.p8,
    paddingHorizontal: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p6,
    borderWidth: 1,
    borderColor: theme.color.border.default,
  },
  timerUrgent: {
    borderColor: theme.color.state.error,
    backgroundColor: '#fee2e2',
  },
  timerText: {
    fontSize: theme.fontSize.p14,
    fontWeight: '600',
    color: theme.color.text.secondary,
  },
  timerTextUrgent: {
    color: theme.color.state.error,
  },
  fareCard: {
    backgroundColor: theme.color.background.surface,
    borderRadius: theme.dimensions.p12,
    padding: theme.dimensions.p16,
    alignItems: 'center',
    marginBottom: theme.dimensions.p16,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fareLabel: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
    marginBottom: theme.dimensions.p4,
  },
  fareValue: {
    fontSize: theme.fontSize.p24,
    fontWeight: '700',
    color: theme.color.primary.actionGreen,
  },
  routeCard: {
    backgroundColor: theme.color.background.surface,
    borderRadius: theme.dimensions.p12,
    padding: theme.dimensions.p16,
    marginBottom: theme.dimensions.p24,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.dimensions.p8,
  },
  dotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.color.primary.actionGreen,
    marginTop: 4,
    marginRight: theme.dimensions.p12,
  },
  dotDestination: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: theme.color.state.error,
    marginTop: 4,
    marginRight: theme.dimensions.p12,
  },
  routeDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.color.border.light,
    marginLeft: 5,
    marginVertical: 2,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.dimensions.p12,
    marginTop: 'auto',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: theme.dimensions.p16,
    borderRadius: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.border.default,
    alignItems: 'center',
    backgroundColor: theme.color.background.surface,
  },
  rejectText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.secondary,
  },
  acceptButton: {
    flex: 2,
    paddingVertical: theme.dimensions.p16,
    borderRadius: theme.dimensions.p12,
    backgroundColor: theme.color.primary.actionGreen,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.white,
  },
});
