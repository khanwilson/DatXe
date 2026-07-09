// 1. IMPORTS
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { RadarAnimation } from 'components/map/RadarAnimation';
import { RouteBookingModal } from 'components/route/RouteBookingModal';
import { VehicleType } from 'components/route/VehicleTypeItem';
import { BackButton } from 'components/navigation/BackButton';
import ZustandSession from 'zustand/session';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useDirections } from 'api/hooks/useGoongPlace';
import { bookingService, CreateBookingDto } from 'api/services/bookingService';
import { paymentService } from 'api/services/paymentService';
import { useBookingSocket } from 'api/socket/useBookingSocket';
import { DRIVER_AVATAR_PLACEHOLDER } from 'constants/trip';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { decodePolyline, getBounds } from 'utils/functions/decodePolyline';

// 2. VARIABLES & TYPES
type BookingScreenState = 'IDLE' | 'BOOKING' | 'PAYMENT' | 'LOOKING' | 'DRIVER_FOUND';

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

const DRIVER_WAIT_TIMEOUT_MS = 90_000;

// 3. COMPONENT FUNCTION
export default function BookingRouteScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const mapRef = useRef<AppMapHandle>(null);
  const bookingModalRef = useRef<BottomSheetModal>(null);
  const { camera, coordinate } = useCurrentLocation();

  const [screenState, setScreenState] = useState<BookingScreenState>('IDLE');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(MOCK_VEHICLES[0].id);
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

  // Driver wait timeout — if LOOKING for too long
  useEffect(() => {
    if (screenState !== 'LOOKING') return;
    const timer = setTimeout(() => {
      setScreenState('IDLE');
      ZustandSession.getState().save('activeBookingId', null);
      bookingModalRef.current?.present();
      Alert.alert('Không tìm được tài xế', 'Hệ thống không tìm được tài xế gần bạn. Vui lòng thử lại.');
    }, DRIVER_WAIT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [screenState]);

  const handlePaymentSuccess = useCallback(() => {
    // Payment confirmed via WS — stay in LOOKING state, waiting for driver
    setScreenState('LOOKING');
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

  const handleNoDriverFound = useCallback(() => {
    setScreenState('IDLE');
    ZustandSession.getState().save('activeBookingId', null);
    bookingModalRef.current?.present();
    Alert.alert('Không tìm được tài xế', 'Hệ thống đã tìm trong khu vực của bạn nhưng không có tài xế khả dụng. Vui lòng thử lại sau.');
  }, []);

  useBookingSocket({
    bookingId: screenState === 'LOOKING' || screenState === 'DRIVER_FOUND' ? (activeBookingId ?? null) : null,
    onPaymentSuccess: handlePaymentSuccess,
    onDriverAssigned: handleDriverAssigned,
    onNoDriverFound: handleNoDriverFound,
  });

  const handleBook = useCallback(async () => {
    if (!effectiveOrigin || !savedDestination || !routeData) {
      Alert.alert('Lỗi', 'Vui lòng chọn điểm đón và điểm đến trước khi đặt xe.');
      return;
    }

    const selected = MOCK_VEHICLES.find((v) => v.id === selectedVehicleId);
    if (!selected) return;

    setScreenState('BOOKING');

    try {
      const totalDistance = directionsData?.summary?.totalDistance?.value ?? 0;
      const totalDuration = directionsData?.summary?.totalDuration?.value ?? 0;

      const bookingDto: CreateBookingDto = {
        pickup_lat: effectiveOrigin.lat,
        pickup_lng: effectiveOrigin.lng,
        pickup_address: savedPickup?.address ?? savedPickup?.name ?? '',
        dropoff_lat: savedDestination.lat,
        dropoff_lng: savedDestination.lng,
        dropoff_address: savedDestination.address ?? savedDestination.name,
        vehicle_type: selected.id,
        estimated_price: selected.discountPrice ?? selected.realPrice,
        distance: totalDistance / 1000,
        estimated_duration: Math.round(totalDuration / 60),
      };

      const booking = await bookingService.createBooking(bookingDto);
      ZustandSession.getState().save('activeBookingId', booking.data.id);

      const vnpayResult = await paymentService.createVnpayUrl(booking.data.id);
      const paymentUrl = vnpayResult.data.paymentUrl;

      setScreenState('PAYMENT');
      bookingModalRef.current?.dismiss();

      await WebBrowser.openBrowserAsync(paymentUrl, { dismissButtonStyle: 'close' });

      // Browser closed — switch to LOOKING state (WS will confirm payment)
      setScreenState('LOOKING');
    } catch {
      setScreenState('IDLE');
      ZustandSession.getState().save('activeBookingId', null);
      bookingModalRef.current?.present();
      Alert.alert('Đặt xe thất bại', 'Có lỗi xảy ra khi đặt xe. Vui lòng thử lại.');
    }
  }, [effectiveOrigin, savedDestination, savedPickup, routeData, selectedVehicleId, directionsData]);

  const isModalVisible = screenState === 'IDLE' || screenState === 'BOOKING';
  const isLooking = screenState === 'LOOKING';
  const mapPaddingBottom = isModalVisible ? 520 : 0;

  return (
    <View style={styles.container}>
      <AppMap
        ref={mapRef}
        camera={camera}
        route={routeData?.route}
        origin={routeData?.origin}
        destination={routeData?.destination}
        bounds={routeData ? { ...routeData.bounds, paddingBottom: mapPaddingBottom } : undefined}
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
          loading={screenState === 'BOOKING'}
          onBook={handleBook}
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
