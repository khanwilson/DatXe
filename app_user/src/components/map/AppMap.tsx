// 1. IMPORTS
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
export interface AppMapHandle {
  // Smoothly animate the map back to a region (used by the recenter button).
  animateToRegion: (region: Region, duration?: number) => void;
}

interface IAppMapProps {
  // Initial region to render.
  region: Region;
  // User's resolved coordinate; when present a marker is drawn.
  userCoordinate?: { latitude: number; longitude: number };
}

const DEFAULT_ANIMATION_MS = 500;

// 3. COMPONENT FUNCTION
export const AppMap = forwardRef<AppMapHandle, IAppMapProps>((props, ref) => {
  const { region, userCoordinate } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (target: Region, duration = DEFAULT_ANIMATION_MS) => {
      mapRef.current?.animateToRegion(target, duration);
    },
  }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {userCoordinate && (
          <Marker
            coordinate={userCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
          >
            <View style={styles.userDotOuter}>
              <View style={styles.userDotInner} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
});

AppMap.displayName = 'AppMap';

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.color.background.surfaceAlt,
  },
  userDotOuter: {
    width: theme.dimensions.p24,
    height: theme.dimensions.p24,
    borderRadius: theme.dimensions.p12,
    backgroundColor: theme.color.map.route,
    opacity: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDotInner: {
    width: theme.dimensions.p12,
    height: theme.dimensions.p12,
    borderRadius: theme.dimensions.p6,
    backgroundColor: theme.color.map.route,
    borderWidth: 2,
    borderColor: theme.color.white,
  },
});

// 5. EXPORT
export default AppMap;
