// 1. IMPORTS
import MapboxGL from '@rnmapbox/maps';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { DEFAULT_CAMERA, MapCamera } from 'constants/mapbox';
import { ITheme, useAppTheme } from 'theme/index';

// 2. VARIABLES & TYPES
export interface AppMapHandle {
  // Smoothly fly the camera to a target (used by the recenter button).
  moveCamera: (camera: MapCamera, duration?: number) => void;
}

interface IAppMapProps {
  // Initial camera position; updates when parent re-renders (e.g. after GPS fix).
  camera?: MapCamera;
}

const DEFAULT_ANIMATION_MS = 500;

// 3. COMPONENT FUNCTION
export const AppMap = forwardRef<AppMapHandle, IAppMapProps>((props, ref) => {
  const { camera = DEFAULT_CAMERA } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  useImperativeHandle(ref, () => ({
    moveCamera: (target: MapCamera, duration = DEFAULT_ANIMATION_MS) => {
      cameraRef.current?.setCamera({
        centerCoordinate: target.centerCoordinate,
        zoomLevel: target.zoomLevel,
        animationDuration: duration,
        animationMode: 'flyTo',
      });
    },
  }));

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={StyleSheet.absoluteFill}
        scaleBarEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: camera.centerCoordinate,
            zoomLevel: camera.zoomLevel,
          }}
          centerCoordinate={camera.centerCoordinate}
          zoomLevel={camera.zoomLevel}
          animationMode="flyTo"
          animationDuration={DEFAULT_ANIMATION_MS}
        />
        <MapboxGL.LocationPuck puckBearingEnabled visible />
      </MapboxGL.MapView>
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
});

// 5. EXPORT
export default AppMap;
