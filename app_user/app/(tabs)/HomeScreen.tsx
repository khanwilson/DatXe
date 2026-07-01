// 1. IMPORTS
import { AppMap, AppMapHandle } from 'components/map/AppMap';
import { SearchPanel } from 'components/map/SearchPanel';
import { useCurrentLocation } from 'components/map/useCurrentLocation';
import { AppText } from 'components/text/AppText';
import { FOCUSED_ZOOM } from 'constants/mapbox';
import { getString } from 'localization/index';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';

// 2. COMPONENT FUNCTION
export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const mapRef = useRef<AppMapHandle>(null);
  const { camera, coordinate, status, request } = useCurrentLocation();

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
    // Destination search / booking entry is wired in T-0035.
  };

  return (
    <View style={styles.container}>
      <AppMap ref={mapRef} camera={camera} />

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
