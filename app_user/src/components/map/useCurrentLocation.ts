// 1. IMPORTS
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Region } from 'react-native-maps';
import { DEFAULT_REGION, FOCUSED_DELTA } from 'constants/map';

// 2. TYPES
export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied';

export interface UseCurrentLocationResult {
  // Region to render — user's location when known, otherwise the fallback.
  region: Region;
  // Resolved coordinate, undefined until the first successful fix.
  coordinate?: { latitude: number; longitude: number };
  status: LocationStatus;
  // Re-request permission and refetch (e.g. from an "enable location" button).
  request: () => Promise<void>;
}

// 3. HOOK
// Resolves the device's foreground location in a non-blocking way: it always
// returns a usable region (falling back to DEFAULT_REGION) so the map never
// blocks on permission or a slow GPS fix.
export const useCurrentLocation = (): UseCurrentLocationResult => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
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
      setRegion({ ...next, ...FOCUSED_DELTA });
      setStatus('granted');
    } catch {
      // Location services off or transient failure — keep the fallback region.
      setStatus('denied');
    }
  }, []);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return { region, coordinate, status, request: resolve };
};
