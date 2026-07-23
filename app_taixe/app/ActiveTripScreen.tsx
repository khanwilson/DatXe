// 1. IMPORTS
import { useDirections } from 'api/hooks/useGoongPlace';
import { useTripActions } from 'api/hooks/useTripActions';
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { BackButton } from 'components/navigation/BackButton';
import { NavigationBanner } from 'components/navigation/NavigationBanner';
import { NavigationBottomBar } from 'components/navigation/NavigationBottomBar';
import { TripStatusSheet } from 'components/trip/TripStatusSheet';
import { AppText } from 'components/text/AppText';
import { MOCK_DRIVER, TripStatus } from 'constants/trip';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const { camera } = useCurrentLocation();

  const params = useLocalSearchParams<{ tripId?: string; vehicleName?: string; fare?: string; pickupLat?: string; pickupLng?: string; destLat?: string; destLng?: string; destinationAddress?: string }>();
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
  const [tripStep, setTripStep] = useState(0);
  // Driver lands here right after tapping "Arrived": trip is DRIVER_ARRIVED and
  // waits at the pickup until the driver taps Start.
  const [status, setStatus] = useState<TripStatus>('ARRIVED');

  const { startTrip, completeTrip, loading } = useTripActions();

  const [navigationMode, setNavigationMode] = useState(false);
  const toggleNavMode = useCallback(() => setNavigationMode((v) => !v), []);
  const handleRecenter = useCallback(() => setNavigationMode(true), []);
  const handleOverview = useCallback(() => setNavigationMode(false), []);

  // ponytail: only allow nav toggle during ARRIVED and IN_PROGRESS
  const showNavToggle = status === 'ARRIVED' || status === 'IN_PROGRESS';

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

    setTripStep(0);
    setDriverCoord(path[0]);
    const iv = setInterval(() => {
      setTripStep((s) => {
        const next = s + 1;
        if (next >= path.length - 1) {
          setDriverCoord(path[path.length - 1]);
          clearInterval(iv);
          return path.length - 1;
        }
        setDriverCoord(path[next]);
        return next;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [status, routeData?.route]);

  // ponytail: trim route line to show only the leg ahead of driver
  const remainingRoute = useMemo(() => {
    const path = routeData?.route;
    if (!path || path.length < 2) return path;
    return path.slice(Math.min(tripStep, path.length - 1));
  }, [routeData?.route, tripStep]);

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

  // Extract steps from Goong directions response (untyped — backend passes raw)
  // ponytail: cast to any since RouteGeometry doesn't declare steps; runtime has them
  const routeSteps = useMemo(() => {
    const route = (directionsData?.routes?.[0] as any);
    const legs = route?.legs;
    if (Array.isArray(legs) && legs.length > 0 && Array.isArray(legs[0].steps)) {
      return legs[0].steps as { instruction: string; distance: { text: string; value: number }; duration: { text: string; value: number } }[];
    }
    return null;
  }, [directionsData]);

  // Advance currentStepIndex proportionally to the driver's progress along the route
  const currentStepIndex = useMemo(() => {
    if (!routeSteps || routeSteps.length === 0) return 0;
    const path = routeData?.route;
    if (!path || path.length < 2) return 0;
    const progress = tripStep / (path.length - 1); // 0..1
    return Math.min(Math.floor(progress * routeSteps.length), routeSteps.length - 1);
  }, [routeSteps, routeData?.route, tripStep]);

  const currentStep = routeSteps?.[currentStepIndex];
  const bannerInstruction = currentStep?.instruction ?? '';
  const bannerStepDistance = currentStep?.distance?.text ?? directionsData?.summary?.totalDistance?.text ?? '';
  const distanceText = directionsData?.summary?.totalDistance?.text ?? '';
  const durationText = directionsData?.summary?.totalDuration?.text ?? '';
  const destinationAddress = params.destinationAddress ?? '';

  return (
    <View style={styles.container}>
      <AppMap
        ref={mapRef}
        camera={camera}
        route={remainingRoute}
        origin={routeData?.origin}
        destination={routeData?.destination}
        driver={driverCoord ?? undefined}
        bounds={routeData?.bounds}
        navigationMode={navigationMode}
      />

      {/* Navigation mode overlays */}
      {navigationMode && (
        <>
          <NavigationBanner
            instruction={bannerInstruction}
            stepDistance={bannerStepDistance}
            destinationName={destinationAddress}
          />
          <NavigationBottomBar
            eta={durationText}
            distance={distanceText}
            onRecenter={handleRecenter}
            onOverview={handleOverview}
          />
        </>
      )}

      {/* Toggle navigation mode FAB — only during ARRIVED / IN_PROGRESS */}
      {showNavToggle && (
        <TouchableOpacity
          style={[styles.navToggle, navigationMode && styles.navToggleActive]}
          onPress={toggleNavMode}
          accessibilityLabel="Toggle navigation mode"
          accessibilityRole="button"
        >
          <AppText style={styles.navToggleIcon}>{navigationMode ? '✕' : '▲'}</AppText>
        </TouchableOpacity>
      )}

      {!navigationMode && (
        <>
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
        </>
      )}
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
  navToggle: {
    position: 'absolute',
    top: theme.dimensions.getHeightHeader - 30,
    right: 16,
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
  navToggleActive: {
    backgroundColor: theme.color.primary.actionGreen,
  },
  navToggleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.color.text.primary,
  },
});
