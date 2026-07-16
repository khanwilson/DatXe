// 1. IMPORTS
import { useDirections } from 'api/hooks/useGoongPlace';
import { useTripSocket } from 'api/hooks/useTripSocket';
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { BackButton } from 'components/navigation/BackButton';
import { TripStatusSheet } from 'components/trip/TripStatusSheet';
import { DriverInfo } from 'constants/trip';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  // Vehicle + fare + driver info carried over from BookingRouteScreen.
  const params = useLocalSearchParams<{
    vehicleName?: string;
    fare?: string;
    bookingId?: string;
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    vehiclePlate?: string;
    vehicleModel?: string;
    driverLat?: string;
    driverLng?: string;
  }>();
  const vehicleName = params.vehicleName ?? '';
  const fare = params.fare ? Number(params.fare) : 0;
  const bookingId = params.bookingId ?? null;

  // Rehydrate driver info from nav params; fall back to Zustand if screen was remounted.
  const sessionDriverInfo = ZustandSession((s) => s.driverInfo);
  const initialDriverInfo: DriverInfo | null = useMemo(() => {
    if (params.driverId && params.driverName) {
      return {
        driverId: params.driverId,
        name: params.driverName,
        phone: params.driverPhone,
        rating: 5.0,
        vehicleModel: params.vehicleModel ?? vehicleName,
        plate: params.vehiclePlate ?? '',
        lat: params.driverLat ? Number(params.driverLat) : undefined,
        lng: params.driverLng ? Number(params.driverLng) : undefined,
      };
    }
    return sessionDriverInfo ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedPickup = ZustandSession((s) => s.selectedPickup);
  const savedDestination = ZustandSession((s) => s.selectedDestination);

  const [routeData, setRouteData] = useState<RouteData | null>(null);

  // Effective origin: saved pickup if present, else current device location.
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

  const { data: directionsData } = useDirections(originParam, destinationParam);

  const originLat = effectiveOrigin?.lat;
  const originLng = effectiveOrigin?.lng;
  const destLat = savedDestination?.lat;
  const destLng = savedDestination?.lng;

  // Build the route geometry once coordinates and directions resolve. Mirrors
  // BookingRouteScreen so the trip screen shows the same polyline + markers.
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

  const { status, driverCoord, driverInfo, cancel } = useTripSocket({
    bookingId,
    initialDriverInfo,
  });

  // While the driver heads to the pickup, draw a separate approach route
  // (driver → pickup) rather than the pickup → dropoff trip route.
  const isEnRoute = status === 'EN_ROUTE';
  const approachOriginParam =
    isEnRoute && driverInfo?.lat != null && driverInfo?.lng != null
      ? `${driverInfo.lat},${driverInfo.lng}`
      : null;
  const approachDestParam =
    isEnRoute && effectiveOrigin
      ? `${effectiveOrigin.lat},${effectiveOrigin.lng}`
      : null;
  const { data: approachDirections } = useDirections(approachOriginParam, approachDestParam);

  const [approachRoute, setApproachRoute] = useState<[number, number][]>([]);
  useEffect(() => {
    const encoded = approachDirections?.routes?.[0]?.overview_polyline?.points;
    if (!encoded) return;
    try {
      const decoded = decodePolyline(encoded);
      if (Array.isArray(decoded) && decoded.length > 0) setApproachRoute(decoded);
    } catch {
      // keep previous approach route on decode failure
    }
  }, [approachDirections]);

  // Fake the driver's approach in dev where the emulator emits no real GPS:
  // advance a step index along the approach route so the line shrinks behind it.
  // ponytail: __DEV__-gated; real device uses live driver.location_updated.
  const [enRouteStep, setEnRouteStep] = useState(0);
  useEffect(() => {
    if (!__DEV__ || !isEnRoute || approachRoute.length < 2) return;
    setEnRouteStep(0);
    const iv = setInterval(() => {
      setEnRouteStep((s) => {
        if (s >= approachRoute.length - 1) {
          clearInterval(iv);
          return s;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isEnRoute, approachRoute]);

  // Only the leg still ahead of the driver: from current position to the pickup.
  const remainingApproach = useMemo(() => {
    if (approachRoute.length < 2) return undefined;
    const from = Math.min(enRouteStep, approachRoute.length - 1);
    return approachRoute.slice(from);
  }, [approachRoute, enRouteStep]);

  // In dev the marker follows the sliced approach; on device it tracks live GPS.
  const enRouteDriverCoord = __DEV__ ? remainingApproach?.[0] ?? null : driverCoord;

  // Dev-only mock: step a marker to the destination once IN_PROGRESS, since the
  // emulator emits no real GPS. Takes precedence over the static socket coord.
  // ponytail: __DEV__-gated; real device uses live driver.location_updated.
  const [mockCoord, setMockCoord] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!__DEV__ || status !== 'IN_PROGRESS') return;
    const path = routeData?.route;
    if (!path || path.length < 2) return;

    let step = 0;
    setMockCoord(path[0]);
    const iv = setInterval(() => {
      step += 1;
      if (step >= path.length - 1) {
        setMockCoord(path[path.length - 1]);
        clearInterval(iv);
        return;
      }
      setMockCoord(path[step]);
    }, 1000);

    return () => clearInterval(iv);
  }, [status, routeData?.route]);

  const effectiveDriverCoord = isEnRoute ? enRouteDriverCoord : mockCoord ?? driverCoord;

  // During approach, show the driver → pickup leg with the pickup as the target
  // marker; otherwise show the pickup → dropoff trip route.
  const mapRoute = isEnRoute ? remainingApproach : routeData?.route;
  const mapOrigin = isEnRoute ? undefined : routeData?.origin;
  const mapDestination = isEnRoute ? routeData?.origin : routeData?.destination;

  // Follow the driver marker during the active legs; entry fit is handled by
  // the bounds prop until the driver starts moving.
  useEffect(() => {
    if (!effectiveDriverCoord) return;
    if (status === 'EN_ROUTE' || status === 'IN_PROGRESS') {
      mapRef.current?.moveCamera({ centerCoordinate: effectiveDriverCoord, zoomLevel: 15 }, 800);
    }
  }, [effectiveDriverCoord, status]);

  const summary = useMemo(
    () => ({
      fare,
      distanceText: directionsData?.summary?.totalDistance?.text ?? '',
      durationText: directionsData?.summary?.totalDuration?.text ?? '',
    }),
    [fare, directionsData],
  );

  const leaveTrip = () => {
    cancel();
    ZustandSession.getState().save('selectedDestination', null);
    ZustandSession.getState().save('selectedPickup', null);
    router.replace('/(tabs)/HomeScreen');
  };

  // Only fit bounds before the driver starts moving to avoid fighting the follow camera.
  const showBounds = status === 'FINDING';

  return (
    <View style={styles.container}>
      <AppMap
        ref={mapRef}
        camera={camera}
        route={mapRoute}
        origin={mapOrigin}
        destination={mapDestination}
        driver={effectiveDriverCoord ?? undefined}
        bounds={showBounds ? routeData?.bounds : undefined}
      />
      <View style={styles.backButtonContainer}>
        <BackButton />
      </View>
      <TripStatusSheet
        status={status}
        driver={driverInfo}
        vehicleName={vehicleName}
        fare={fare}
        summary={summary}
        onCancel={leaveTrip}
        onDone={leaveTrip}
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
