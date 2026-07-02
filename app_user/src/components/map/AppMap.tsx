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

export interface MapBounds {
  ne: [number, number];
  sw: [number, number];
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

interface IAppMapProps {
  // Initial camera position; updates when parent re-renders (e.g. after GPS fix).
  camera?: MapCamera;
  // Route polyline coordinates in GeoJSON order [lng, lat]
  route?: [number, number][];
  // Origin marker coordinate [lng, lat]
  origin?: [number, number];
  // Destination marker coordinate [lng, lat]
  destination?: [number, number];
  // Bounds to fit the map to (typically for route display)
  bounds?: MapBounds;
}

const DEFAULT_ANIMATION_MS = 500;

// 3. COMPONENT FUNCTION
export const AppMap = forwardRef<AppMapHandle, IAppMapProps>((props, ref) => {
  const { camera = DEFAULT_CAMERA, route, origin, destination, bounds } = props;
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

  const routeGeoJSON = useMemo((): GeoJSON.Feature<GeoJSON.LineString> | undefined => {
    if (!route || route.length === 0) return undefined;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route,
      },
    };
  }, [route]);

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
          bounds={
            bounds
              ? {
                  ne: bounds.ne,
                  sw: bounds.sw,
                  paddingTop: bounds.paddingTop ?? 100,
                  paddingBottom: bounds.paddingBottom ?? 200,
                  paddingLeft: bounds.paddingLeft ?? 50,
                  paddingRight: bounds.paddingRight ?? 50,
                }
              : undefined
          }
        />
        <MapboxGL.LocationPuck puckBearingEnabled visible />

        {routeGeoJSON && (
          <MapboxGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
            <MapboxGL.LineLayer
              id="routeLine"
              style={{
                lineColor: theme.color.map.route,
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {origin && (
          <MapboxGL.PointAnnotation id="originMarker" coordinate={origin}>
            <View style={styles.markerOrigin} />
          </MapboxGL.PointAnnotation>
        )}

        {destination && (
          <MapboxGL.PointAnnotation id="destinationMarker" coordinate={destination}>
            <View style={styles.markerDestination} />
          </MapboxGL.PointAnnotation>
        )}
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
  markerOrigin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.color.map.pinStart,
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerDestination: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.color.map.pinEnd,
    borderWidth: 3,
    borderColor: '#fff',
  },
});

// 5. EXPORT
export default AppMap;
