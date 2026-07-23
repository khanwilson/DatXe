// 1. IMPORTS
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { BackButton } from 'components/navigation/BackButton';
import { NavigationBanner } from 'components/navigation/NavigationBanner';
import { NavigationBottomBar } from 'components/navigation/NavigationBottomBar';
import { AppText } from 'components/text/AppText';
import { AppButton } from 'components/button/AppButton';
import { useDirections } from 'api/hooks/useGoongPlace';
import { useTripActions } from 'api/hooks/useTripActions';
import { ITheme, useAppTheme } from 'theme/index';
import { getString } from 'localization/index';
import { decodePolyline, getBounds } from 'utils/functions/decodePolyline';

// 2. VARIABLES & TYPES
interface RouteData {
  route: [number, number][];
  origin: [number, number];
  destination: [number, number];
  bounds: MapBounds;
}

// 3. COMPONENT FUNCTION
export default function PickupNavigationScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const router = useRouter();
  const mapRef = useRef<AppMapHandle>(null);
  const { camera, coordinate } = useCurrentLocation();

  const params = useLocalSearchParams<{
    tripId: string;
    pickupLat: string;
    pickupLng: string;
    pickupAddress: string;
    destinationLat: string;
    destinationLng: string;
    destinationAddress: string;
    fare: string;
  }>();

  const tripId = params.tripId ?? '';
  const pickupLat = params.pickupLat ? Number(params.pickupLat) : null;
  const pickupLng = params.pickupLng ? Number(params.pickupLng) : null;
  const pickupAddress = params.pickupAddress ?? '';

  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [navigationMode, setNavigationMode] = useState(false);
  // Index of the driver's current position along routeData.route (fake movement).
  const [step, setStep] = useState(0);

  const originParam = coordinate
    ? `${coordinate.latitude},${coordinate.longitude}`
    : null;
  const destinationParam =
    pickupLat != null && pickupLng != null
      ? `${pickupLat},${pickupLng}`
      : null;

  const { data: directionsData } = useDirections(originParam, destinationParam);
  const { arrivedAtPickup, loading } = useTripActions();

  // Build route geometry when coordinates and directions resolve
  useEffect(() => {
    if (!coordinate || pickupLat == null || pickupLng == null) return;

    const originCoord: [number, number] = [coordinate.longitude, coordinate.latitude];
    const destCoord: [number, number] = [pickupLng, pickupLat];
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
            bounds: { ...bounds, paddingBottom: 300, paddingTop: 100 },
          });
          return;
        }
      } catch {
        // fall through to markers-only
      }
    }

    setRouteData({
      route: [],
      origin: originCoord,
      destination: destCoord,
      bounds: { ne: destCoord, sw: originCoord, paddingBottom: 300, paddingTop: 100 },
    });
  }, [coordinate, pickupLat, pickupLng, directionsData]);

  // Fake the driver's approach: advance the step index along the pickup route so
  // the map shows movement in the emulator where real GPS never changes.
  // ponytail: pure client animation, no camera follow; swap for real GPS ticks when live.
  useEffect(() => {
    const path = routeData?.route;
    if (!path || path.length < 2) return;

    setStep(0);
    const iv = setInterval(() => {
      setStep((s) => {
        if (s >= path.length - 1) {
          clearInterval(iv);
          return s;
        }
        return s + 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [routeData?.route]);

  // Draw only the leg still ahead of the driver: from the current position to the
  // pickup. As the fake marker advances, the trailing line disappears behind it.
  const remainingRoute = useMemo(() => {
    const path = routeData?.route;
    if (!path || path.length < 2) return undefined;
    const from = Math.min(step, path.length - 1);
    return path.slice(from);
  }, [routeData?.route, step]);

  const driverCoord = remainingRoute?.[0] ?? null;

  const toggleNavMode = useCallback(() => setNavigationMode((v) => !v), []);
  const handleRecenter = useCallback(() => setNavigationMode(true), []);
  const handleOverview = useCallback(() => setNavigationMode(false), []);

  const handleArrived = useCallback(async () => {
    if (!tripId) return;
    try {
      await arrivedAtPickup(tripId);
      router.replace({
        pathname: '/ActiveTripScreen',
        params: {
          tripId,
          pickupLat: params.pickupLat ?? '',
          pickupLng: params.pickupLng ?? '',
          destLat: params.destinationLat ?? '',
          destLng: params.destinationLng ?? '',
          destinationAddress: params.destinationAddress ?? '',
          fare: params.fare ?? '0',
        },
      });
    } catch {
      // Error is tracked in useTripActions; stay on screen so driver can retry
    }
  }, [tripId, arrivedAtPickup, router, params.pickupLat, params.pickupLng, params.destinationLat, params.destinationLng, params.destinationAddress, params.fare]);

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
  // ponytail: simple proportional mapping — step index tracks route coord index
  const currentStepIndex = useMemo(() => {
    if (!routeSteps || routeSteps.length === 0) return 0;
    const path = routeData?.route;
    if (!path || path.length < 2) return 0;
    const progress = step / (path.length - 1); // 0..1
    return Math.min(Math.floor(progress * routeSteps.length), routeSteps.length - 1);
  }, [routeSteps, routeData?.route, step]);

  const currentStep = routeSteps?.[currentStepIndex];
  // Fallback to summary if steps unavailable
  const bannerInstruction = currentStep?.instruction ?? '';
  const bannerStepDistance = currentStep?.distance?.text ?? directionsData?.summary?.totalDistance?.text ?? '';
  const durationText = directionsData?.summary?.totalDuration?.text ?? '';
  const distanceText = directionsData?.summary?.totalDistance?.text ?? '';

  return (
    <View style={styles.container}>
      <AppMap
        ref={mapRef}
        camera={camera}
        route={remainingRoute}
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
            destinationName={pickupAddress}
          />
          <NavigationBottomBar
            eta={durationText}
            distance={distanceText}
            onRecenter={handleRecenter}
            onOverview={handleOverview}
          />
        </>
      )}

      {/* Toggle navigation mode FAB */}
      <TouchableOpacity
        style={[styles.navToggle, navigationMode && styles.navToggleActive]}
        onPress={toggleNavMode}
        accessibilityLabel="Toggle navigation mode"
        accessibilityRole="button"
      >
        <AppText style={styles.navToggleIcon}>{navigationMode ? '✕' : '▲'}</AppText>
      </TouchableOpacity>

      {!navigationMode && (
        <>
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <AppText style={styles.sheetTitle}>{getString('pickupNavigationTitle')}</AppText>
            <AppText style={styles.addressLabel}>{getString('pickupAddress')}</AppText>
            <AppText style={styles.addressText}>{pickupAddress}</AppText>
            <AppButton
              style={[styles.arrivedButton, loading && styles.arrivedButtonDisabled]}
              textStyle={styles.arrivedText}
              text={loading ? '...' : getString('driverArrivedButton')}
              onPress={handleArrived}
              disabled={loading}
            />
          </View>
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
  sheet: {
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
  sheetTitle: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p12,
  },
  addressLabel: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p16,
  },
  arrivedButton: {
    paddingVertical: theme.dimensions.p16,
    borderRadius: theme.dimensions.p12,
    backgroundColor: theme.color.primary.actionGreen,
    alignItems: 'center',
  },
  arrivedButtonDisabled: {
    opacity: 0.6,
  },
  arrivedText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: theme.color.white,
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
