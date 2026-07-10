// 1. IMPORTS
import { useDirections } from 'api/hooks/useGoongPlace';
import { useTripActions } from 'api/hooks/useTripActions';
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { BackButton } from 'components/navigation/BackButton';
import { TripStatusSheet } from 'components/trip/TripStatusSheet';
import { MOCK_DRIVER, TripStatus } from 'constants/trip';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { decodePolyline, getBounds } from 'utils/functions/decodePolyline';
import ZustandSession from 'zustand/session';

// 2. VARIABLES & TYPES
interface RouteData {
  route: [number, number][];
  origin: [number, number];
  destination: [number, number];
  bounds: MapBounds;
}

// 3. COMPONENT FUNCTION
export default function ActiveTripScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const router = useRouter();
  const mapRef = useRef<AppMapHandle>(null);
  const { camera, coordinate } = useCurrentLocation();

  const params = useLocalSearchParams<{ tripId?: string; vehicleName?: string; fare?: string; pickupLat?: string; pickupLng?: string; destLat?: string; destLng?: string }>();
  const tripId = params.tripId ?? '';
  const vehicleName = params.vehicleName ?? '';
  const fare = params.fare ? Number(params.fare) : 0;

  // Trip coords come from the offer/pickup nav params — the driver app never
  // populates the Zustand pickup/destination the passenger app uses.
  const pickupLat = params.pickupLat ? Number(params.pickupLat) : null;
  const pickupLng = params.pickupLng ? Number(params.pickupLng) : null;
  const paramDestLat = params.destLat ? Number(params.destLat) : null;
  const paramDestLng = params.destLng ? Number(params.destLng) : null;

  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [driverCoord, setDriverCoord] = useState<[number, number] | null>(null);
  // Driver lands here right after tapping "Arrived": trip is DRIVER_ARRIVED and
  // waits at the pickup until the driver taps Start.
  const [status, setStatus] = useState<TripStatus>('ARRIVED');

  const { startTrip, completeTrip, loading } = useTripActions();

  const originParam =
    pickupLat != null && pickupLng != null ? `${pickupLat},${pickupLng}` : null;
  const destinationParam =
    paramDestLat != null && paramDestLng != null ? `${paramDestLat},${paramDestLng}` : null;

  const { data: directionsData } = useDirections(originParam, destinationParam);

  const originLat = pickupLat;
  const originLng = pickupLng;
  const destLat = paramDestLat;
  const destLng = paramDestLng;

  useEffect(() => {
    if (originLat == null || originLng == null || destLat == null || destLng == null) {
      return;
    }

    const originCoord: [number, number] = [originLng, originLat];
    const destCoord: [number, number] = [destLng, destLat];
    const encoded = directionsData?.routes?.[0]?.overview_polyline?.points;

    if (encoded) {
      try {
        const decoded = decodePolyline(encoded);
        if (Array.isArray(decoded) && decoded.length > 0) {
          const bounds = getBounds(decoded);
          setRouteData({
            route: decoded,
            origin: originCoord,
            destination: destCoord,
            bounds: { ...bounds, paddingBottom: 360, paddingTop: 100 },
          });
          return;
        }
      } catch {
        // Fall through to markers-only below on decode failure.
      }
    }

    setRouteData({
      route: [],
      origin: originCoord,
      destination: destCoord,
      bounds: { ne: destCoord, sw: originCoord, paddingBottom: 360, paddingTop: 100 },
    });
  }, [originLat, originLng, destLat, destLng, directionsData]);

  const summary = useMemo(
    () => ({
      fare,
      distanceText: directionsData?.summary?.totalDistance?.text ?? '',
      durationText: directionsData?.summary?.totalDuration?.text ?? '',
    }),
    [fare, directionsData],
  );

  const handleStartTrip = useCallback(async () => {
    if (!tripId || loading) return;
    await startTrip(tripId);
    setStatus('IN_PROGRESS');
  }, [tripId, loading, startTrip]);

  // Once moving, step the driver marker along the route to the destination so
  // the map shows progress in the emulator where GPS never changes.
  // ponytail: pure client animation; swap for real GPS ticks when live.
  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;
    const path = routeData?.route;
    if (!path || path.length < 2) return;

    let step = 0;
    setDriverCoord(path[0]);
    const iv = setInterval(() => {
      step += 1;
      if (step >= path.length - 1) {
        setDriverCoord(path[path.length - 1]);
        clearInterval(iv);
        return;
      }
      setDriverCoord(path[step]);
    }, 1000);

    return () => clearInterval(iv);
  }, [status, routeData?.route]);

  const handleCompleteTrip = useCallback(async () => {
    if (!tripId || loading) return;
    await completeTrip(tripId);
    ZustandSession.getState().save('selectedDestination', null);
    ZustandSession.getState().save('selectedPickup', null);
    router.replace({
      pathname: '/TripCompleteScreen',
      params: {
        fare: String(fare),
        distanceText: directionsData?.summary?.totalDistance?.text ?? '',
        durationText: directionsData?.summary?.totalDuration?.text ?? '',
      },
    });
  }, [tripId, loading, completeTrip, router, fare, directionsData]);

  const handleCancel = useCallback(() => {
    ZustandSession.getState().save('selectedDestination', null);
    ZustandSession.getState().save('selectedPickup', null);
    router.replace('/(tabs)/HomeScreen');
  }, [router]);

  return (
    <View style={styles.container}>
      <AppMap
        ref={mapRef}
        camera={camera}
        route={routeData?.route}
        origin={routeData?.origin}
        destination={routeData?.destination}
        driver={driverCoord ?? undefined}
        bounds={routeData?.bounds}
      />
      <View style={styles.backButtonContainer}>
        <BackButton />
      </View>
      <TripStatusSheet
        status={status}
        driver={MOCK_DRIVER}
        vehicleName={vehicleName}
        fare={fare}
        summary={summary}
        onCancel={handleCancel}
        onDone={handleCompleteTrip}
        onStartTrip={handleStartTrip}
      />
    </View>
  );
}

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
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
});
