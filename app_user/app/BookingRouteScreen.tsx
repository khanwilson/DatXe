// 1. IMPORTS
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { RouteBookingModal } from 'components/route/RouteBookingModal';
import { VehicleType } from 'components/route/VehicleTypeItem';
import { BackButton } from 'components/navigation/BackButton';
import ZustandSession from 'zustand/session';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useDirections } from 'api/hooks/useGoongPlace';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { decodePolyline, getBounds } from 'utils/functions/decodePolyline';

// 2. VARIABLES & TYPES
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

// 3. COMPONENT FUNCTION
export default function BookingRouteScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const mapRef = useRef<AppMapHandle>(null);
  const bookingModalRef = useRef<BottomSheetModal>(null);
  const { camera, coordinate } = useCurrentLocation();
  const [routeData, setRouteData] = useState<{
    route: [number, number][];
    origin: [number, number];
    destination: [number, number];
    bounds: MapBounds;
  } | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(MOCK_VEHICLES[0].id);

  // Subscribe to session pickup + destination reactively so the screen rebuilds
  // the route when either changes (getState() would only read a static snapshot).
  const savedPickup = ZustandSession((s) => s.selectedPickup);
  const savedDestination = ZustandSession((s) => s.selectedDestination);

  // Determine the effective origin: use the saved pickup if it has a coordinate,
  // otherwise fall back to the device's current location.
  const effectiveOrigin = savedPickup
    ? { lat: savedPickup.lat, lng: savedPickup.lng }
    : coordinate
      ? { lat: coordinate.latitude, lng: coordinate.longitude }
      : null;

  const originParam = effectiveOrigin
    ? `${effectiveOrigin.lat},${effectiveOrigin.lng}`
    : null;
  const destinationParam = savedDestination
    ? `${savedDestination.lat},${savedDestination.lng}`
    : null;

  const { data: directionsData, isSuccess: directionsSuccess, isError, error } = useDirections(originParam, destinationParam);

  const originLat = effectiveOrigin?.lat;
  const originLng = effectiveOrigin?.lng;
  const destLat = savedDestination?.lat;
  const destLng = savedDestination?.lng;

  // Log any errors for debugging
  useEffect(() => {
    if (isError && error) {
      console.error('Directions error:', error);
    }
  }, [isError, error]);

  // Build markers + polyline in a single effect keyed on the coordinates and the
  // directions payload. Keeping it in one place avoids the race where the polyline
  // effect read a stale (null) routeData before the markers effect had committed.
  useEffect(() => {
    if (originLat == null || originLng == null || destLat == null || destLng == null) {
      return;
    }

    const originCoord: [number, number] = [originLng, originLat];
    const destCoord: [number, number] = [destLng, destLat];

    // More robust handling of directions data
    const route = directionsData?.routes?.[0];
    if (route?.overview_polyline?.points) {
      try {
        const decodedCoords = decodePolyline(route.overview_polyline.points);
        // Additional check to ensure decodedCoords is valid
        if (Array.isArray(decodedCoords) && decodedCoords.length > 0) {
          const bounds = getBounds(decodedCoords);
          setRouteData({
            route: decodedCoords,
            origin: originCoord,
            destination: destCoord,
            bounds: { ...bounds, paddingBottom: 520, paddingTop: 100 },
          });
          // Only present modal if we have a valid route
          if (directionsSuccess) {
            bookingModalRef.current?.present();
          }
        } else {
          // Invalid or empty route data - show markers only
          setRouteData({
            route: [],
            origin: originCoord,
            destination: destCoord,
            bounds: { ne: destCoord, sw: originCoord, paddingBottom: 520, paddingTop: 100 },
          });
        }
      } catch (decodeError) {
        console.error('Error decoding polyline:', decodeError);
        // Show markers only on decode error
        setRouteData({
          route: [],
          origin: originCoord,
          destination: destCoord,
          bounds: { ne: destCoord, sw: originCoord, paddingBottom: 520, paddingTop: 100 },
        });
      }
    } else {
      // Coordinates known but directions not resolved yet — show the markers.
      setRouteData({
        route: [],
        origin: originCoord,
        destination: destCoord,
        bounds: { ne: destCoord, sw: originCoord, paddingBottom: 520, paddingTop: 100 },
      });
    }
  }, [originLat, originLng, destLat, destLng, directionsData, directionsSuccess, isError]);

  return (
    <View style={styles.container}>
      <AppMap
        ref={mapRef}
        camera={camera}
        route={routeData?.route}
        origin={routeData?.origin}
        destination={routeData?.destination}
        bounds={routeData?.bounds}
      />
      <View style={styles.backButtonContainer}>
        <BackButton />
      </View>
      <RouteBookingModal
        ref={bookingModalRef}
        vehicles={MOCK_VEHICLES}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
        onBook={() => {
          const selected = MOCK_VEHICLES.find((v) => v.id === selectedVehicleId);
          bookingModalRef.current?.dismiss();
          router.push({
            pathname: '/ActiveTripScreen',
            params: {
              vehicleName: selected?.name ?? '',
              fare: String(selected?.discountPrice ?? selected?.realPrice ?? 0),
            },
          });
        }}
      />
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
