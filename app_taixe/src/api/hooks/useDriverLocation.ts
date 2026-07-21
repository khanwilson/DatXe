// 1. IMPORTS
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';
import ZustandPersist from 'zustand/persist';

// 2. VARIABLES & TYPES
interface DriverLocation {
  lat: number;
  lng: number;
  heading?: number;
}

interface UseDriverLocationReturn {
  location: DriverLocation | null;
  error: string | null;
  startBroadcasting: () => void;
  stopBroadcasting: () => void;
}

// Haversine formula to calculate distance between two coordinates (in meters)
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Minimum distance in meters before broadcasting (to save battery)
const MIN_DISTANCE_METERS = 10;

// Broadcast interval in milliseconds. Doubles as an online heartbeat: the
// backend treats a driver as stale/offline if their last location is older than
// its own stale threshold (currently 45s = ~3 missed beats).
const BROADCAST_INTERVAL_MS = 15000;

// 3. HOOK
export const useDriverLocation = (): UseDriverLocationReturn => {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const broadcastTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBroadcastLocationRef = useRef<DriverLocation | null>(null);
  // The watch callback is a long-lived closure; read broadcasting state via a
  // ref so it never fires stale. Location doubles as an online heartbeat, so we
  // must NOT broadcast while offline — otherwise a moving-but-offline driver
  // keeps their timestamp fresh and the backend still treats them as a candidate.
  const isBroadcastingRef = useRef(false);

  const broadcastLocation = useCallback(async (loc: DriverLocation) => {
    const token = ZustandPersist.getState().accessToken;
    if (!token) return;
    try {
      if (__DEV__) {
        console.debug('[DriverLocation] Broadcasting location:', loc);
      }
      await apiClient.patch(ENDPOINTS.DRIVER.UPDATE_LOCATION, loc);
    } catch (err) {
      console.debug('[DriverLocation] Broadcast failed:', err);
    }
  }, []);

  // Start watching position immediately so the map can center on the driver
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        setLocation({
          lat: current.coords.latitude,
          lng: current.coords.longitude,
          heading: current.coords.heading ?? undefined,
        });

        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (loc) => {
            const newLoc: DriverLocation = {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              heading: loc.coords.heading ?? undefined,
            };
            setLocation(newLoc);

            if (!lastBroadcastLocationRef.current) {
              lastBroadcastLocationRef.current = newLoc;
              return;
            }

            const moved = calculateDistance(
              lastBroadcastLocationRef.current.lat,
              lastBroadcastLocationRef.current.lng,
              newLoc.lat,
              newLoc.lng,
            );
            if (moved >= MIN_DISTANCE_METERS) {
              lastBroadcastLocationRef.current = newLoc;
              // Only broadcast (= heartbeat) while online; a moving offline driver
              // must not keep their server timestamp fresh.
              if (isBroadcastingRef.current) {
                broadcastLocation(newLoc);
              }
            }
          },
        );
        if (cancelled) {
          sub.remove();
          return;
        }
        locationSubRef.current = sub;
      } catch (err) {
        console.debug('[DriverLocation] Init failed:', err);
        setError('Failed to get location');
      }
    };

    init();

    return () => {
      cancelled = true;
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
    };
  }, [broadcastLocation]);

  const startBroadcasting = useCallback(async () => {
    if (isBroadcasting) return;
    isBroadcastingRef.current = true;
    setIsBroadcasting(true);

    if (lastBroadcastLocationRef.current) {
      broadcastLocation(lastBroadcastLocationRef.current);
    }

    broadcastTimerRef.current = setInterval(() => {
      if (lastBroadcastLocationRef.current) {
        broadcastLocation(lastBroadcastLocationRef.current);
      }
    }, BROADCAST_INTERVAL_MS);

    console.debug('[DriverLocation] Started broadcasting');
  }, [isBroadcasting, broadcastLocation]);

  const stopBroadcasting = useCallback(() => {
    if (!isBroadcasting) return;

    if (broadcastTimerRef.current) {
      clearInterval(broadcastTimerRef.current);
      broadcastTimerRef.current = null;
    }

    isBroadcastingRef.current = false;
    setIsBroadcasting(false);
    console.debug('[DriverLocation] Stopped broadcasting');
  }, [isBroadcasting]);

  // Cleanup broadcast timer on unmount
  useEffect(() => {
    return () => {
      if (broadcastTimerRef.current) {
        clearInterval(broadcastTimerRef.current);
      }
    };
  }, []);

  return {
    location,
    error,
    startBroadcasting,
    stopBroadcasting,
  };
};
