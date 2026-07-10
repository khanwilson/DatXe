import { useEffect, useRef } from 'react';
import { getSocket } from './socketClient';

export interface DriverAssignedPayload {
  bookingId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverLat: number;
  driverLng: number;
  driverRating?: number;
  driverAvatar?: string;
  tripId?: string;
}

// Nested shape emitted by the backend (`booking.driver_assigned`).
interface DriverAssignedWirePayload {
  bookingId: string;
  tripId: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    rating: number;
    lat: number;
    lng: number;
  };
}

const mapWireDriverAssigned = (wire: DriverAssignedWirePayload): DriverAssignedPayload => ({
  bookingId: wire.bookingId,
  tripId: wire.tripId,
  driverId: wire.driver.id,
  driverName: wire.driver.name,
  driverPhone: wire.driver.phone,
  vehiclePlate: wire.driver.vehiclePlate,
  vehicleModel: wire.driver.vehicleType,
  driverLat: wire.driver.lat,
  driverLng: wire.driver.lng,
  driverRating: wire.driver.rating,
});

export interface PaymentSuccessPayload {
  bookingId: string;
  paymentStatus: string;
}

export interface AwaitingDecisionPayload {
  bookingId: string;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
}

export interface BookingCancelledPayload {
  bookingId: string;
  reason: string;
  refundStatus: string;
}

export interface PaymentFailedPayload {
  bookingId: string;
  responseCode: string;
  paymentStatus: string;
}

export interface TripStatusChangedPayload {
  tripId: string;
  bookingId: string;
  status: string;
}

export interface DriverLocationUpdatedPayload {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
}

interface UseBookingSocketOptions {
  bookingId: string | null;
  driverId?: string | null;
  onPaymentSuccess?: (payload: PaymentSuccessPayload) => void;
  onPaymentFailed?: (payload: PaymentFailedPayload) => void;
  onDriverAssigned?: (payload: DriverAssignedPayload) => void;
  onAwaitingDecision?: (payload: AwaitingDecisionPayload) => void;
  onBookingCancelled?: (payload: BookingCancelledPayload) => void;
  onTripStatusChanged?: (payload: TripStatusChangedPayload) => void;
  onDriverLocationUpdated?: (payload: DriverLocationUpdatedPayload) => void;
}

// DEV mock: simulates WS events when real socket is not available
const runDevMock = (
  bookingId: string,
  onPaymentSuccess?: (p: PaymentSuccessPayload) => void,
  onDriverAssigned?: (p: DriverAssignedPayload) => void,
  onTripStatusChanged?: (p: TripStatusChangedPayload) => void,
  onDriverLocationUpdated?: (p: DriverLocationUpdatedPayload) => void,
) => {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];

  timers.push(setTimeout(() => {
    onPaymentSuccess?.({ bookingId, paymentStatus: 'SUCCESSFUL' });
  }, 3000));

  timers.push(setTimeout(() => {
    onDriverAssigned?.({
      bookingId, driverId: 'dev-driver-001', driverName: 'Nguyễn Văn A',
      driverPhone: '0901234567', vehiclePlate: '30A-123.45', vehicleModel: 'Toyota Vios',
      driverLat: 21.028, driverLng: 105.854,
    });
  }, 8000));

  timers.push(setTimeout(() => {
    onTripStatusChanged?.({ tripId: 'dev-trip-001', bookingId, status: 'DRIVER_EN_ROUTE' });
    // Periodic location ticks during EN_ROUTE
    let tick = 0;
    const iv = setInterval(() => {
      onDriverLocationUpdated?.({ driverId: 'dev-driver-001', lat: 21.028 + tick * 0.0005, lng: 105.854 + tick * 0.0003 });
      tick++;
    }, 2000);
    intervals.push(iv);
    timers.push(setTimeout(() => clearInterval(iv), 12000));
  }, 12000));

  timers.push(setTimeout(() => {
    onTripStatusChanged?.({ tripId: 'dev-trip-001', bookingId, status: 'DRIVER_ARRIVED' });
  }, 20000));

  timers.push(setTimeout(() => {
    onTripStatusChanged?.({ tripId: 'dev-trip-001', bookingId, status: 'IN_PROGRESS' });
    let tick = 0;
    const iv = setInterval(() => {
      onDriverLocationUpdated?.({ driverId: 'dev-driver-001', lat: 21.033 + tick * 0.0008, lng: 105.857 + tick * 0.0005 });
      tick++;
    }, 2000);
    intervals.push(iv);
    timers.push(setTimeout(() => clearInterval(iv), 30000));
  }, 25000));

  timers.push(setTimeout(() => {
    onTripStatusChanged?.({ tripId: 'dev-trip-001', bookingId, status: 'COMPLETED' });
  }, 60000));

  return () => {
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
  };
};

export const useBookingSocket = ({
  bookingId,
  driverId,
  onPaymentSuccess,
  onPaymentFailed,
  onDriverAssigned,
  onAwaitingDecision,
  onBookingCancelled,
  onTripStatusChanged,
  onDriverLocationUpdated,
}: UseBookingSocketOptions) => {
  const mockCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    let useMock = false;
    const socket = getSocket();

    const connectTimeout = setTimeout(() => {
      if (!socket.connected && __DEV__) {
        useMock = true;
        mockCleanupRef.current = runDevMock(bookingId, onPaymentSuccess, onDriverAssigned, onTripStatusChanged, onDriverLocationUpdated);
      }
    }, 2000);

    const handleConnect = () => {
      clearTimeout(connectTimeout);
      socket.emit('join', `booking:${bookingId}`);
    };

    const handlePaymentSuccess = (payload: PaymentSuccessPayload) => {
      if (payload.bookingId === bookingId) onPaymentSuccess?.(payload);
    };

    const handlePaymentFailed = (payload: PaymentFailedPayload) => {
      if (payload.bookingId === bookingId) onPaymentFailed?.(payload);
    };

    const handleDriverAssigned = (wire: DriverAssignedWirePayload) => {
      if (wire.bookingId === bookingId) onDriverAssigned?.(mapWireDriverAssigned(wire));
    };

    const handleAwaitingDecision = (payload: AwaitingDecisionPayload) => {
      if (payload.bookingId === bookingId) onAwaitingDecision?.(payload);
    };

    const handleBookingCancelled = (payload: BookingCancelledPayload) => {
      if (payload.bookingId === bookingId) onBookingCancelled?.(payload);
    };

    const handleTripStatusChanged = (payload: TripStatusChangedPayload) => {
      if (payload.bookingId === bookingId) onTripStatusChanged?.(payload);
    };

    const handleDriverLocationUpdated = (payload: DriverLocationUpdatedPayload) => {
      // Filter by driverId if known, otherwise accept all
      if (driverId && payload.driverId !== driverId) return;
      onDriverLocationUpdated?.(payload);
    };

    if (socket.connected) {
      clearTimeout(connectTimeout);
      socket.emit('join', `booking:${bookingId}`);
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('booking.payment_success', handlePaymentSuccess);
    socket.on('booking.payment_failed', handlePaymentFailed);
    socket.on('booking.driver_assigned', handleDriverAssigned);
    socket.on('booking.awaiting_decision', handleAwaitingDecision);
    socket.on('booking.cancelled', handleBookingCancelled);
    socket.on('trip.status_changed', handleTripStatusChanged);
    socket.on('driver.location_updated', handleDriverLocationUpdated);

    return () => {
      clearTimeout(connectTimeout);
      socket.off('connect', handleConnect);
      socket.off('booking.payment_success', handlePaymentSuccess);
      socket.off('booking.payment_failed', handlePaymentFailed);
      socket.off('booking.driver_assigned', handleDriverAssigned);
      socket.off('booking.awaiting_decision', handleAwaitingDecision);
      socket.off('booking.cancelled', handleBookingCancelled);
      socket.off('trip.status_changed', handleTripStatusChanged);
      socket.off('driver.location_updated', handleDriverLocationUpdated);
      if (socket.connected) socket.emit('leave', `booking:${bookingId}`);
      if (useMock && mockCleanupRef.current) mockCleanupRef.current();
    };
  }, [bookingId, driverId, onPaymentSuccess, onPaymentFailed, onDriverAssigned, onAwaitingDecision, onBookingCancelled, onTripStatusChanged, onDriverLocationUpdated]);
};
