// Mock driver-tracking lifecycle for the active-trip screen.
//
// This hook owns the simulated ride: it advances through TripStatus and moves a
// driver marker along the route. It is deliberately isolated from the screen and
// the status sheet so the realtime feed (T-0026/T-0028) can replace it later
// without reworking the UI — the screen only consumes the returned shape.

import { TRIP_TIMING, TripStatus } from 'constants/trip';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTripSimulationParams {
  // Route polyline in GeoJSON order [lng, lat]; empty until directions resolve.
  route: [number, number][];
  // Pickup coordinate [lng, lat].
  origin: [number, number] | null;
  // Dropoff coordinate [lng, lat].
  destination: [number, number] | null;
}

interface UseTripSimulationResult {
  status: TripStatus;
  // Current driver marker position [lng, lat], or null before assignment.
  driverCoord: [number, number] | null;
  cancel: () => void;
}

// Linear interpolation between two coordinates.
const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

export const useTripSimulation = (
  params: UseTripSimulationParams,
): UseTripSimulationResult => {
  const { route, origin, destination } = params;

  const [status, setStatus] = useState<TripStatus>('FINDING');
  const [driverCoord, setDriverCoord] = useState<[number, number] | null>(null);

  // Hold every active timer/interval so we can clear them on cancel/unmount.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    clearAll();
  }, [clearAll]);

  // Drive the driver marker from `from` to `to` over `steps` ticks, then run
  // `onDone`. Returns immediately; progress happens on the shared interval.
  const animateAlong = useCallback(
    (points: [number, number][], onDone: () => void) => {
      if (points.length < 2) {
        onDone();
        return;
      }
      let step = 0;
      const total = points.length - 1;
      setDriverCoord(points[0]);
      intervalRef.current = setInterval(() => {
        if (cancelledRef.current) return;
        step += 1;
        if (step >= total) {
          setDriverCoord(points[total]);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onDone();
          return;
        }
        setDriverCoord(points[step]);
      }, TRIP_TIMING.moveTickMs);
    },
    [],
  );

  useEffect(() => {
    // Wait until we have the geometry needed to simulate movement.
    if (!origin || !destination || route.length < 2) return;

    cancelledRef.current = false;

    // Approach path: a synthetic straight line into the pickup so the driver
    // visibly "arrives". Start offset slightly from origin toward the route end.
    const approachStart = lerp(origin, route[route.length - 1], 0.15);
    const approach: [number, number][] = [];
    for (let i = 0; i <= TRIP_TIMING.enRouteSteps; i += 1) {
      approach.push(lerp(approachStart, origin, i / TRIP_TIMING.enRouteSteps));
    }

    // FINDING → EN_ROUTE after the finding delay.
    const findingTimer = setTimeout(() => {
      if (cancelledRef.current) return;
      setStatus('EN_ROUTE');
      animateAlong(approach, () => {
        if (cancelledRef.current) return;
        setStatus('ARRIVED');
        // ARRIVED → IN_PROGRESS, then move along the real route to destination.
        const startTimer = setTimeout(() => {
          if (cancelledRef.current) return;
          setStatus('IN_PROGRESS');
          animateAlong(route, () => {
            if (cancelledRef.current) return;
            setStatus('COMPLETED');
          });
        }, TRIP_TIMING.arrivedMs);
        timersRef.current.push(startTimer);
      });
    }, TRIP_TIMING.findingMs);
    timersRef.current.push(findingTimer);

    return clearAll;
    // Re-run only when the geometry identity changes.
  }, [origin, destination, route, animateAlong, clearAll]);

  return { status, driverCoord, cancel };
};
