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
}

export interface PaymentSuccessPayload {
  bookingId: string;
  bookingStatus: string;
  paymentStatus: string;
}

interface UseBookingSocketOptions {
  bookingId: string | null;
  onPaymentSuccess?: (payload: PaymentSuccessPayload) => void;
  onDriverAssigned?: (payload: DriverAssignedPayload) => void;
  onNoDriverFound?: (bookingId: string) => void;
}

// DEV mock: simulates WS events when real socket is not available
const runDevMock = (
  bookingId: string,
  onPaymentSuccess?: (p: PaymentSuccessPayload) => void,
  onDriverAssigned?: (p: DriverAssignedPayload) => void,
) => {
  const t1 = setTimeout(() => {
    onPaymentSuccess?.({
      bookingId,
      bookingStatus: 'PAYMENT_COMPLETED',
      paymentStatus: 'SUCCESSFUL',
    });
  }, 3000);

  const t2 = setTimeout(() => {
    onDriverAssigned?.({
      bookingId,
      driverId: 'dev-driver-001',
      driverName: 'Nguyễn Văn A',
      driverPhone: '0901234567',
      vehiclePlate: '30A-123.45',
      vehicleModel: 'Toyota Vios',
      driverLat: 21.028,
      driverLng: 105.854,
    });
  }, 8000);

  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
  };
};

export const useBookingSocket = ({
  bookingId,
  onPaymentSuccess,
  onDriverAssigned,
  onNoDriverFound,
}: UseBookingSocketOptions) => {
  const mockCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    let useMock = false;
    const socket = getSocket();

    const connectTimeout = setTimeout(() => {
      if (!socket.connected) {
        useMock = true;
        mockCleanupRef.current = runDevMock(bookingId, onPaymentSuccess, onDriverAssigned);
      }
    }, 2000);

    const handleConnect = () => {
      clearTimeout(connectTimeout);
      socket.emit('join', `booking:${bookingId}`);
    };

    const handlePaymentSuccess = (payload: PaymentSuccessPayload) => {
      if (payload.bookingId === bookingId) onPaymentSuccess?.(payload);
    };

    const handleDriverAssigned = (payload: DriverAssignedPayload) => {
      if (payload.bookingId === bookingId) onDriverAssigned?.(payload);
    };

    const handleNoDriverFound = (payload: { bookingId: string }) => {
      if (payload.bookingId === bookingId) onNoDriverFound?.(payload.bookingId);
    };

    if (socket.connected) {
      clearTimeout(connectTimeout);
      socket.emit('join', `booking:${bookingId}`);
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('booking.payment_success', handlePaymentSuccess);
    socket.on('booking.driver_assigned', handleDriverAssigned);
    socket.on('booking.no_driver_found', handleNoDriverFound);

    return () => {
      clearTimeout(connectTimeout);
      socket.off('connect', handleConnect);
      socket.off('booking.payment_success', handlePaymentSuccess);
      socket.off('booking.driver_assigned', handleDriverAssigned);
      socket.off('booking.no_driver_found', handleNoDriverFound);
      if (socket.connected) socket.emit('leave', `booking:${bookingId}`);
      if (useMock && mockCleanupRef.current) mockCleanupRef.current();
    };
  }, [bookingId, onPaymentSuccess, onDriverAssigned, onNoDriverFound]);
};
