// 1. IMPORTS
import { DriverAssignedPayload, DriverLocationUpdatedPayload, TripStatusChangedPayload, useBookingSocket } from 'api/socket/useBookingSocket';
import { backendStatusToTripStatus, DriverInfo, TripStatus } from 'constants/trip';
import { useCallback, useState } from 'react';
import ZustandSession from 'zustand/session';

// 2. VARIABLES & TYPES
interface UseTripSocketOptions {
  bookingId: string | null;
  initialDriverInfo?: DriverInfo | null;
}

interface UseTripSocketResult {
  status: TripStatus;
  driverCoord: [number, number] | null;
  driverInfo: DriverInfo | null;
  tripId: string | null;
  cancel: () => void;
}

// 3. HOOK
export const useTripSocket = ({ bookingId, initialDriverInfo }: UseTripSocketOptions): UseTripSocketResult => {
  const [status, setStatus] = useState<TripStatus>('FINDING');
  const [driverCoord, setDriverCoord] = useState<[number, number] | null>(
    initialDriverInfo?.lat != null && initialDriverInfo?.lng != null
      ? [initialDriverInfo.lng, initialDriverInfo.lat]
      : null,
  );
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(initialDriverInfo ?? null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(initialDriverInfo?.driverId ?? null);

  const onDriverAssigned = useCallback((payload: DriverAssignedPayload) => {
    const info: DriverInfo = {
      driverId: payload.driverId,
      name: payload.driverName,
      phone: payload.driverPhone,
      rating: payload.driverRating ?? 5.0,
      vehicleModel: payload.vehicleModel,
      plate: payload.vehiclePlate,
      lat: payload.driverLat,
      lng: payload.driverLng,
    };
    setDriverInfo(info);
    setDriverId(payload.driverId);
    setDriverCoord([payload.driverLng, payload.driverLat]);
    ZustandSession.getState().save('driverInfo', info);
  }, []);

  const onTripStatusChanged = useCallback((payload: TripStatusChangedPayload) => {
    const mapped = backendStatusToTripStatus(payload.status);
    if (mapped) setStatus(mapped);
    if (payload.tripId) {
      setTripId(payload.tripId);
      ZustandSession.getState().save('activeTripId', payload.tripId);
    }
  }, []);

  const onDriverLocationUpdated = useCallback((payload: DriverLocationUpdatedPayload) => {
    setDriverCoord([payload.lng, payload.lat]);
  }, []);

  const cancel = useCallback(() => {
    ZustandSession.getState().save('activeTripId', null);
    ZustandSession.getState().save('driverInfo', null);
  }, []);

  // ponytail: driverId is null until onDriverAssigned fires, so location events from any
  // driver are accepted in the pre-assignment (FINDING) window — no location UI is shown then,
  // so it's harmless. Tighten to default-reject if a driver pin ever renders before assignment.
  useBookingSocket({
    bookingId,
    driverId,
    onDriverAssigned,
    onTripStatusChanged,
    onDriverLocationUpdated,
  });

  return { status, driverCoord, driverInfo, tripId, cancel };
};
