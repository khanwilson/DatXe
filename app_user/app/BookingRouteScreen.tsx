// 1. IMPORTS
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { FOCUSED_ZOOM, MapCamera } from 'constants/mapbox';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { RadarAnimation } from 'components/map/RadarAnimation';
import { RouteBookingModal, PaymentMethod } from 'components/route/RouteBookingModal';
import { VehicleType } from 'components/route/VehicleTypeItem';
import { BackButton } from 'components/navigation/BackButton';
import ZustandSession from 'zustand/session';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useDirections } from 'api/hooks/useGoongPlace';
import { bookingService, CreateBookingDto } from 'api/services/bookingService';
import { paymentService } from 'api/services/paymentService';
import { useBookingSocket } from 'api/socket/useBookingSocket';
import { DRIVER_AVATAR_PLACEHOLDER } from 'constants/trip';
import { getString } from 'localization/index';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { decodePolyline, getBounds } from 'utils/functions/decodePolyline';

// 2. VARIABLES & TYPES
type BookingScreenState = 'IDLE' | 'BOOKING' | 'PAYMENT' | 'LOOKING' | 'AWAITING_DECISION' | 'DRIVER_FOUND';

const MOCK_VEHICLES: VehicleType[] = [
  {
    id: 'xe4cho',
    name: 'Xe 4 chỗ',
    icon: 'https://www.shutterstock.com/image-vector/car-icon-small-sedan-600w-521952196.jpg',
    eta: '3 phút',
    realPrice: 50000,
    discountPrice: 45000,
  },
  {
    id: 'xe7cho',
    name: 'Xe 7 chỗ',
    icon: 'https://png.pngtree.com/png-clipart/20220110/ourmid/pngtree-hand-drawn-suv-models-png-image_4136981.png',
    eta: '5 phút',
    realPrice: 80000,
    discountPrice: 72000,
  },
  {
    id: 'xevip',
    name: 'Xe VIP',
    icon: 'https://thumbs.dreamstime.com/b/vip-taxi-service-vector-icon-filled-flat-sign-mobile-concept-web-design-luxury-glyph-symbol-logo-illustration-graphics-224065941.jpg',
    eta: '7 phút',
    realPrice: 120000,
    discountPrice: 108000,
  },
];

// Dev-safe client IP: a mobile app cannot know its public IP, and VNPay only uses
// vnp_IpAddr for auditing. Backend accepts any non-empty string.
const CLIENT_IP_FALLBACK = '127.0.0.1';

// Max time the user may stay on the VNPay page before we give up, close the
// browser, and report a timeout. ponytail: 10 min; tune to VNPay order expiry.
const PAYMENT_TIMEOUT_MS = 10 * 60_000;

// 3. COMPONENT FUNCTION
export default function BookingRouteScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const mapRef = useRef<AppMapHandle>(null);
  const bookingModalRef = useRef<BottomSheetModal>(null);
  const { camera, coordinate } = useCurrentLocation();

  const [screenState, setScreenState] = useState<BookingScreenState>('IDLE');
  // Server-driven decision window (ms) from booking.awaiting_decision — kept in
  // sync with the BE auto-cancel timer so the countdown animation ends when the
  // booking is actually cancelled server-side.
  const [decisionTimeoutMs, setDecisionTimeoutMs] = useState<number>(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(MOCK_VEHICLES[0].id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VNPAY');
  const [routeData, setRouteData] = useState<{
    route: [number, number][];
    origin: [number, number];
    destination: [number, number];
    bounds: MapBounds;
  } | null>(null);

  const savedPickup = ZustandSession((s) => s.selectedPickup);
  const savedDestination = ZustandSession((s) => s.selectedDestination);
  const activeBookingId = ZustandSession((s) => s.activeBookingId);

  const effectiveOrigin = useMemo(() => {
    if (savedPickup) {
      return { lat: savedPickup.lat, lng: savedPickup.lng };
    }
    if (coordinate) {
      return { lat: coordinate.latitude, lng: coordinate.longitude };
    }
    return null;
  }, [savedPickup, coordinate]);

  const originParam = effectiveOrigin ? `${effectiveOrigin.lat},${effectiveOrigin.lng}` : null;
  const destinationParam = savedDestination ? `${savedDestination.lat},${savedDestination.lng}` : null;

  const { data: directionsData, isSuccess: directionsSuccess, isError, error } = useDirections(originParam, destinationParam);

  const originLat = effectiveOrigin?.lat;
  const originLng = effectiveOrigin?.lng;
  const destLat = savedDestination?.lat;
  const destLng = savedDestination?.lng;

  useEffect(() => {
    if (isError && error) {
      console.error('Directions error:', error);
    }
  }, [isError, error]);

  useEffect(() => {
    if (originLat == null || originLng == null || destLat == null || destLng == null) return;

    const originCoord: [number, number] = [originLng, originLat];
    const destCoord: [number, number] = [destLng, destLat];
    const route = directionsData?.routes?.[0];

    if (route?.overview_polyline?.points) {
      try {
        const decodedCoords = decodePolyline(route.overview_polyline.points);
        if (Array.isArray(decodedCoords) && decodedCoords.length > 0) {
          const bounds = getBounds(decodedCoords);
          setRouteData({
            route: decodedCoords,
            origin: originCoord,
            destination: destCoord,
            bounds: { ...bounds, paddingBottom: 520, paddingTop: 100 },
          });
          if (directionsSuccess && screenState === 'IDLE') {
            bookingModalRef.current?.present();
          }
          return;
        }
      } catch {
        // fall through
      }
    }

    setRouteData({
      route: [],
      origin: originCoord,
      destination: destCoord,
      bounds: { ne: destCoord, sw: originCoord, paddingBottom: 520, paddingTop: 100 },
    });
  }, [originLat, originLng, destLat, destLng, directionsData, directionsSuccess, isError, screenState]);

  // Refs so async continuations see the latest outcome without stale closures.
  const wsConfirmedPaidRef = useRef(false);
  const wsFailedRef = useRef(false);
  // Each handleBook call bumps this. Stale polls/timeouts from a previous attempt
  // compare against it and stay silent, so they can't alert over a newer attempt.
  const paymentAttemptRef = useRef(0);

  const handlePaymentSuccess = useCallback(() => {
    // Payment confirmed via WS — close the in-app browser (it only shows the raw
    // callback JSON) and switch to LOOKING.
    wsConfirmedPaidRef.current = true;
    WebBrowser.dismissBrowser();
    setScreenState('LOOKING');
  }, []);

  const handlePaymentFailed = useCallback(() => {
    // VNPay reported cancel/decline via WS — close the browser and re-enable
    // the book button immediately instead of waiting for a client-side timeout.
    wsFailedRef.current = true;
    WebBrowser.dismissBrowser();
    setScreenState('IDLE');
    ZustandSession.getState().save('activeBookingId', null);
    Alert.alert('Thanh toán thất bại', 'Giao dịch bị hủy hoặc không thành công. Vui lòng thử lại.');
  }, []);

  const handleDriverAssigned = useCallback((payload: import('api/socket/useBookingSocket').DriverAssignedPayload) => {
    setScreenState('DRIVER_FOUND');
    ZustandSession.getState().save('activeTripId', payload.tripId ?? null);
    ZustandSession.getState().save('driverInfo', {
      driverId: payload.driverId,
      name: payload.driverName,
      avatar: payload.driverAvatar ?? DRIVER_AVATAR_PLACEHOLDER,
      rating: payload.driverRating ?? 5.0,
      vehicleModel: payload.vehicleModel,
      plate: payload.vehiclePlate,
    });
    const selected = MOCK_VEHICLES.find((v) => v.id === selectedVehicleId);
    router.push({
      pathname: '/ActiveTripScreen',
      params: {
        vehicleName: selected?.name ?? '',
        fare: String(selected?.discountPrice ?? selected?.realPrice ?? 0),
        bookingId: activeBookingId ?? '',
        driverName: payload.driverName,
        vehiclePlate: payload.vehiclePlate,
        vehicleModel: payload.vehicleModel,
        driverLat: String(payload.driverLat),
        driverLng: String(payload.driverLng),
        driverId: payload.driverId,
      },
    });
  }, [router, selectedVehicleId, activeBookingId]);

  // No driver found but the booking is paid. Switch to the continue/cancel
  // decision row instead of dumping the user back to IDLE (which would let them
  // re-book and pay twice). The modal is re-presented by the effect below —
  // during LOOKING it's unmounted, so present() can't run synchronously here.
  const handleAwaitingDecision = useCallback(
    (payload: import('api/socket/useBookingSocket').AwaitingDecisionPayload) => {
      setDecisionTimeoutMs(payload.timeoutMs);
      setScreenState('AWAITING_DECISION');
    },
    [],
  );

  const goHome = useCallback(() => {
    ZustandSession.getState().save('activeBookingId', null);
    router.replace('/(tabs)/HomeScreen');
  }, [router]);

  // Booking was cancelled server-side (user cancel, auto-timeout, or all drivers
  // busy after retries exhausted). Refund, if any, is already handled by the BE.
  const handleBookingCancelled = useCallback(
    (payload: import('api/socket/useBookingSocket').BookingCancelledPayload) => {
      if (payload.reason === 'ALL_DRIVERS_BUSY') {
        Alert.alert('Hủy chuyến', getString('bookingAllDriversBusy'));
      }
      goHome();
    },
    [goHome],
  );

  const handleContinueSearch = useCallback(async () => {
    if (!activeBookingId) return;
    try {
      setScreenState('LOOKING');
      await bookingService.retryBooking(activeBookingId);
    } catch (err) {
      console.error('[BookingRouteScreen] retry failed:', err);
      setScreenState('AWAITING_DECISION');
      Alert.alert('Lỗi', 'Không thể tiếp tục tìm tài xế. Vui lòng thử lại.');
    }
  }, [activeBookingId]);

  const handleCancelTrip = useCallback(async () => {
    if (!activeBookingId) {
      goHome();
      return;
    }
    try {
      await bookingService.cancelBooking(activeBookingId);
    } catch (err) {
      console.error('[BookingRouteScreen] cancel failed:', err);
    }
    goHome();
  }, [activeBookingId, goHome]);

  useBookingSocket({
    bookingId:
      screenState === 'LOOKING' ||
      screenState === 'DRIVER_FOUND' ||
      screenState === 'AWAITING_DECISION' ||
      screenState === 'PAYMENT'
        ? activeBookingId ?? null
        : null,
    onPaymentSuccess: handlePaymentSuccess,
    onPaymentFailed: handlePaymentFailed,
    onDriverAssigned: handleDriverAssigned,
    onAwaitingDecision: handleAwaitingDecision,
    onBookingCancelled: handleBookingCancelled,
  });

  // The modal is unmounted during LOOKING (radar takes over), so it can't be
  // presented synchronously from the WS handler. Present it here once it has
  // re-mounted for the decision state.
  useEffect(() => {
    if (screenState === 'AWAITING_DECISION') {
      bookingModalRef.current?.present();
    }
  }, [screenState]);

  const handleBook = useCallback(async () => {
    if (!effectiveOrigin || !savedDestination || !routeData) {
      Alert.alert('Lỗi', 'Vui lòng chọn điểm đón và điểm đến trước khi đặt xe.');
      return;
    }

    const selected = MOCK_VEHICLES.find((v) => v.id === selectedVehicleId);
    if (!selected) return;

    const bookingAmount = selected.discountPrice ?? selected.realPrice;
    const attempt = ++paymentAttemptRef.current;
    wsConfirmedPaidRef.current = false;
    wsFailedRef.current = false;
    setScreenState('BOOKING');

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let handledByTimeout = false;

    try {
      const bookingDto: CreateBookingDto = {
        pickup_lat: effectiveOrigin.lat,
        pickup_lng: effectiveOrigin.lng,
        pickup_address: savedPickup?.address ?? savedPickup?.name ?? '',
        dropoff_lat: savedDestination.lat,
        dropoff_lng: savedDestination.lng,
        dropoff_address: savedDestination.address ?? savedDestination.name,
        vehicle_type: selected.id,
        estimated_price: bookingAmount,
        payment_method: paymentMethod === 'CASH' ? 'CASH' : 'VNPAY',
      };

      const booking = await bookingService.createBooking(bookingDto);
      ZustandSession.getState().save('activeBookingId', booking.data.id);

      // Cash: skip VNPay, go directly to looking for a driver.
      if (paymentMethod === 'CASH') {
        setScreenState('LOOKING');
        return;
      }

      // Safe booking reference (no spaces, URL-safe) with price for auditing.
      // Ponytail: ASCII/URL limit; avoid unicode/diacritics.
      const orderInfo = `DatXe Booking ${booking.data.id.slice(0, 8)}, ${Math.round(bookingAmount / 1000)}k VND`;

      const vnpayParams = {
        bookingId: booking.data.id,
        amount: bookingAmount,
        orderInfo,
        clientIp: CLIENT_IP_FALLBACK,
      };

      const vnpayResult = await paymentService.createVnpayUrl(vnpayParams);
      const paymentUrl = vnpayResult.data.payment_url; // field renamed

      // Keep the modal open with the book button in its loading state.
      setScreenState('PAYMENT');

      // Give up after PAYMENT_TIMEOUT_MS: close the browser and report a timeout
      // rather than leaving the user stranded on the VNPay page.
      timeoutId = setTimeout(() => {
        if (paymentAttemptRef.current !== attempt) return;
        if (wsConfirmedPaidRef.current || wsFailedRef.current) return;
        handledByTimeout = true;
        WebBrowser.dismissBrowser();
        setScreenState('IDLE');
        ZustandSession.getState().save('activeBookingId', null);
        Alert.alert('Hết thời gian thanh toán', 'Bạn chưa hoàn tất thanh toán trong thời gian cho phép. Vui lòng thử lại.');
      }, PAYMENT_TIMEOUT_MS);

      await WebBrowser.openBrowserAsync(paymentUrl, { dismissButtonStyle: 'close' });
      if (timeoutId) clearTimeout(timeoutId);

      // A newer booking attempt superseded this one — stay silent.
      if (paymentAttemptRef.current !== attempt) return;

      // WS or the timeout already resolved this attempt (success handler set
      // LOOKING; failure/timeout handler reset to IDLE + alerted). Don't re-handle.
      if (handledByTimeout || wsFailedRef.current || wsConfirmedPaidRef.current) return;

      // Browser closed manually with no WS signal — user abandoned payment.
      // Reset to IDLE so the book button is usable again. Success/failure that
      // arrives later still comes through the WS handlers.
      setScreenState('IDLE');
      ZustandSession.getState().save('activeBookingId', null);
    } catch (rawError) {
      if (timeoutId) clearTimeout(timeoutId);
      if (paymentAttemptRef.current !== attempt) return;
      setScreenState('IDLE');
      ZustandSession.getState().save('activeBookingId', null);
      console.error('[BookingRouteScreen] booking/payment failed:', rawError);
      Alert.alert('Đặt xe thất bại', 'Có lỗi xảy ra khi đặt xe. Vui lòng thử lại.');
    }
  }, [effectiveOrigin, savedDestination, savedPickup, routeData, selectedVehicleId, directionsData, paymentMethod]);

  const isModalVisible = screenState === 'IDLE' || screenState === 'BOOKING' || screenState === 'PAYMENT' || screenState === 'AWAITING_DECISION';
  const isLooking = screenState === 'LOOKING';
  const mapPaddingBottom = isModalVisible ? 520 : 0;

  // When looking, use pickup as camera so the declarative Camera component
  // doesn't snap back to GPS on re-render.
  const mapCamera = useMemo<MapCamera>(() => {
    if (isLooking && originLat != null && originLng != null) {
      return { centerCoordinate: [originLng, originLat], zoomLevel: FOCUSED_ZOOM };
    }
    return camera;
  }, [isLooking, originLat, originLng, camera]);

  return (
    <View style={styles.container}>
      <AppMap
        ref={mapRef}
        camera={mapCamera}
        route={routeData?.route}
        origin={routeData?.origin}
        destination={routeData?.destination}
        bounds={!isLooking && routeData ? { ...routeData.bounds, paddingBottom: mapPaddingBottom } : undefined}
      />
      <View style={styles.backButtonContainer}>
        <BackButton />
      </View>
      {isLooking && (
        <View style={styles.radarContainer}>
          <RadarAnimation size={280} />
        </View>
      )}
      {isModalVisible && (
        <RouteBookingModal
          ref={bookingModalRef}
          vehicles={MOCK_VEHICLES}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
          loading={screenState === 'BOOKING' || screenState === 'PAYMENT'}
          onBook={handleBook}
          paymentMethod={paymentMethod}
          onChangePaymentMethod={setPaymentMethod}
          awaitingDecision={screenState === 'AWAITING_DECISION'}
          onContinue={handleContinueSearch}
          onCancel={handleCancelTrip}
          decisionTimeoutMs={decisionTimeoutMs}
        />
      )}
    </View>
  );
}

// 4. STYLESHEET
const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
  },
  backButtonContainer: {
    position: 'absolute',
    top: theme.dimensions.getHeightHeader - 30,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  radarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    pointerEvents: 'none',
  },
});
