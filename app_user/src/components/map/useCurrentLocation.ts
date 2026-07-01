// 1. IMPORTS
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CAMERA, FOCUSED_ZOOM, MapCamera } from 'constants/mapbox';

// 2. TYPES
export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied';

export interface UseCurrentLocationResult {
  // Render-ready camera — user's location when known, otherwise the fallback.
  camera: MapCamera;
  // Resolved coordinate, undefined until the first successful fix.
  coordinate?: { latitude: number; longitude: number };
  status: LocationStatus;
  // Re-request permission and refetch (e.g. from an "enable location" button).
  request: () => Promise<void>;
}

// 3. HOOK
// Resolves the device's foreground location in a non-blocking way: it always
// returns a usable camera (falling back to DEFAULT_CAMERA) so the map never
// blocks on permission or a slow GPS fix.
export const useCurrentLocation = (): UseCurrentLocationResult => {
  const [camera, setCamera] = useState<MapCamera>(DEFAULT_CAMERA);
  const [coordinate, setCoordinate] =
    useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [status, setStatus] = useState<LocationStatus>('idle');

  const resolve = useCallback(async () => {
    setStatus('loading');
    try {
      const { status: permission } =
        await Location.requestForegroundPermissionsAsync();
      if (permission !== Location.PermissionStatus.GRANTED) {
        setStatus('denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoordinate(next);
      // GeoJSON order: [longitude, latitude]
      setCamera({ centerCoordinate: [next.longitude, next.latitude], zoomLevel: FOCUSED_ZOOM });
      setStatus('granted');
    } catch {
      // Location services off or transient failure — keep the fallback camera.
      setStatus('denied');
    }
  }, []);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return { camera, coordinate, status, request: resolve };
};
