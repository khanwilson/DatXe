// 1. IMPORTS
import { AppMap, AppMapHandle, MapBounds } from 'components/map/AppMap';
import { SearchPanel } from 'components/map/SearchPanel';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { getString } from 'localization/index';
import { useDirections } from 'api/hooks/useGoongPlace';
import { decodePolyline, getBounds } from 'utils/functions/decodePolyline';
import { AppText } from 'components/text/AppText';
import { FOCUSED_ZOOM } from 'constants/mapbox';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';
import { router, useFocusEffect } from 'expo-router';
import ZustandSession from 'zustand/session';

// 2. COMPONENT FUNCTION
export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const mapRef = useRef<AppMapHandle>(null);
  const { camera, coordinate, status, request } = useCurrentLocation();
  const [routeData, setRouteData] = useState<{
    route: [number, number][];
    origin: [number, number];
    destination: [number, number];
    bounds: MapBounds;
    distance: string;
    duration: string;
  } | null>(null);

  const origin = coordinate ? `${coordinate.latitude},${coordinate.longitude}` : null;
  const destination = routeData?.destination
    ? `${routeData.destination[1]},${routeData.destination[0]}`
    : null;

  const { data: directionsData, isLoading: directionsLoading, error: directionsError } = useDirections(
    origin,
    routeData ? `${routeData.destination[1]},${routeData.destination[0]}` : null
  );

  // Read selected destination from session storage when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const selectedDest = ZustandSession.getState().selectedDestination;
      if (selectedDest && coordinate) {
        const originCoord: [number, number] = [coordinate.longitude, coordinate.latitude];
        const destCoord: [number, number] = [selectedDest.lng, selectedDest.lat];

        // Fetch directions
        setRouteData({
          route: [],
          origin: originCoord,
          destination: destCoord,
          bounds: { ne: [0, 0], sw: [0, 0] },
          distance: '',
          duration: '',
        });

        // Clear after reading
        ZustandSession.getState().save('selectedDestination', null);
      }
    }, [coordinate])
  );

  // Update route when directions data arrives
  React.useEffect(() => {
    if (directionsData && routeData) {
      const route = directionsData.routes?.[0];
      if (route?.overview_polyline?.points) {
        const decodedCoords = decodePolyline(route.overview_polyline.points);
        const bounds = getBounds(decodedCoords);
        const summary = directionsData.summary;

        setRouteData(prev => prev ? {
          ...prev,
          route: decodedCoords,
          bounds,
          distance: summary?.totalDistance?.text || '',
          duration: summary?.totalDuration?.text || '',
        } : null);
      }
    }
  }, [directionsData]);

  const handleRecenter = () => {
    if (coordinate) {
      // GeoJSON order: [longitude, latitude]
      mapRef.current?.moveCamera({
        centerCoordinate: [coordinate.longitude, coordinate.latitude],
        zoomLevel: FOCUSED_ZOOM,
      });
    } else {
      // No fix yet — try to (re)acquire the location.
      request();
    }
  };

  const handleSearch = () => {
    router.push('/SearchDestinationScreen');
  };

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

      {/* Route summary card */}
      {routeData && routeData.route.length > 0 && (
        <View style={[styles.routeCard, { bottom: insets.bottom + theme.dimensions.p96 }]}>
          {directionsLoading ? (
            <ActivityIndicator size="small" color={theme.color.primary.actionGreen} />
          ) : directionsError ? (
            <AppText style={styles.routeError}>
              {getString('routeFetchError')}
            </AppText>
          ) : (
            <>
              <View style={styles.routeMetric}>
                <AppText style={styles.routeMetricValue}>
                  {routeData.distance}
                </AppText>
                <AppText style={styles.routeMetricLabel}>
                  {getString('routeDistanceLabel')}
                </AppText>
              </View>
              <View style={styles.routeDivider} />
              <View style={styles.routeMetric}>
                <AppText style={styles.routeMetricValue}>
                  {routeData.duration}
                </AppText>
                <AppText style={styles.routeMetricLabel}>
                  {getString('routeDurationLabel')}
                </AppText>
              </View>
            </>
          )}
        </View>
      )}

      {/* Permission-denied banner — non-blocking, offers a re-request. */}
      {status === 'denied' && (
        <View style={[styles.banner, { top: insets.top + theme.dimensions.p12 }]}>
          <AppText style={styles.bannerText} numberOfLines={2}>
            {getString('homeLocationDenied')}
          </AppText>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={request}
            activeOpacity={0.8}
          >
            <AppText style={styles.bannerButtonText}>
              {getString('homeEnableLocation')}
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Recenter FAB sits just above the search panel. */}
      <TouchableOpacity
        style={styles.recenter}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <View style={styles.recenterDot} />
      </TouchableOpacity>

      <View style={styles.panelWrap}>
        <SearchPanel onPressSearch={handleSearch} />
      </View>
    </View>
  );
}

// 3. STYLESHEET
const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
  },
  routeCard: {
    position: 'absolute',
    left: theme.dimensions.p16,
    right: theme.dimensions.p16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.card.bg,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p12,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  routeMetric: {
    flex: 1,
    alignItems: 'center',
  },
  routeMetricValue: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.primary,
  },
  routeMetricLabel: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
    marginTop: theme.dimensions.p4,
  },
  routeDivider: {
    width: 1,
    height: theme.dimensions.p32,
    backgroundColor: theme.color.border.light,
    marginHorizontal: theme.dimensions.p12,
  },
  routeError: {
    fontSize: theme.fontSize.p14,
    color: theme.color.state.error,
    textAlign: 'center',
  },
  banner: {
    position: 'absolute',
    left: theme.dimensions.p16,
    right: theme.dimensions.p16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.dimensions.p12,
    backgroundColor: theme.color.card.bg,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p12,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  bannerText: {
    flex: 1,
    fontSize: theme.fontSize.p14,
    color: theme.color.text.primary,
  },
  bannerButton: {
    backgroundColor: theme.color.button.primaryBg,
    borderRadius: theme.dimensions.p8,
    paddingHorizontal: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p8,
  },
  bannerButtonText: {
    fontSize: theme.fontSize.p14,
    fontWeight: '600',
    color: theme.color.button.primaryText,
  },
  recenter: {
    position: 'absolute',
    right: theme.dimensions.p16,
    bottom: theme.dimensions.p96 + theme.dimensions.p48,
    width: theme.dimensions.p48,
    height: theme.dimensions.p48,
    borderRadius: theme.dimensions.p24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.card.bg,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  recenterDot: {
    width: theme.dimensions.p16,
    height: theme.dimensions.p16,
    borderRadius: theme.dimensions.p8,
    borderWidth: 2,
    borderColor: theme.color.map.route,
  },
  panelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
