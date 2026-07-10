// 1. IMPORTS
import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from 'api/socket/socketClient';

// 2. VARIABLES & TYPES
// Nested shape consumed by the dashboard/OfferScreen.
export interface NewOfferPayload {
  offerId: string;
  bookingId: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  fare: number;
  expiresAt: string;
}

// Flat shape emitted by the backend (`driver.new_offer`).
interface NewOfferWirePayload {
  offerId: string;
  bookingId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  estimatedPrice: number;
  vehicleType: string;
  distanceKm: number;
  expiresAt: string;
}

const mapWireOffer = (wire: NewOfferWirePayload): NewOfferPayload => ({
  offerId: wire.offerId,
  bookingId: wire.bookingId,
  pickup: {
    address: wire.pickupAddress,
    lat: wire.pickupLat,
    lng: wire.pickupLng,
  },
  destination: {
    address: wire.dropoffAddress,
    lat: wire.dropoffLat,
    lng: wire.dropoffLng,
  },
  fare: wire.estimatedPrice,
  expiresAt: wire.expiresAt,
});

interface UseDriverSocketOptions {
  enabled: boolean;
  onNewOffer?: (payload: NewOfferPayload) => void;
}

// DEV mock: simulates a new_offer event when real socket is not available
const runDevMock = (onNewOffer?: (p: NewOfferWirePayload) => void) => {
  const timer = setTimeout(() => {
    console.debug('[DriverSocket] DEV mock: simulating new_offer event');
    onNewOffer?.({
      offerId: 'dev-offer-001',
      bookingId: 'dev-booking-001',
      pickupAddress: '120 Hai Ba Trung, Hanoi',
      pickupLat: 21.0285,
      pickupLng: 105.8542,
      dropoffAddress: 'San bay Noi Bai, Hanoi',
      dropoffLat: 21.2187,
      dropoffLng: 105.8021,
      estimatedPrice: 150000,
      vehicleType: 'xe4cho',
      distanceKm: 3.2,
      expiresAt: new Date(Date.now() + 30000).toISOString(),
    });
  }, 5000);

  return () => clearTimeout(timer);
};

// 3. HOOK
export const useDriverSocket = ({ enabled, onNewOffer }: UseDriverSocketOptions) => {
  const mockCleanupRef = useRef<(() => void) | null>(null);
  const onNewOfferRef = useRef(onNewOffer);
  onNewOfferRef.current = onNewOffer;

  useEffect(() => {
    if (!enabled) {
      disconnectSocket();
      return;
    }

    let useMock = false;
    const socket = getSocket();

    const handleNewOffer = (wire: NewOfferWirePayload) => {
      console.debug('[DriverSocket] Received new_offer:', wire.offerId);
      onNewOfferRef.current?.(mapWireOffer(wire));
    };

    // If socket doesn't connect within 3s, use mock in dev mode
    const connectTimeout = setTimeout(() => {
      if (!socket.connected && __DEV__) {
        useMock = true;
        console.debug('[DriverSocket] Using DEV mock (socket not connected)');
        mockCleanupRef.current = runDevMock(handleNewOffer);
      }
    }, 3000);

    const handleConnect = () => {
      clearTimeout(connectTimeout);
      console.debug('[DriverSocket] Connected, ready for offers');
    };

    if (socket.connected) {
      clearTimeout(connectTimeout);
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('driver.new_offer', handleNewOffer);

    return () => {
      clearTimeout(connectTimeout);
      socket.off('connect', handleConnect);
      socket.off('driver.new_offer', handleNewOffer);
      if (useMock && mockCleanupRef.current) {
        mockCleanupRef.current();
      }
    };
  }, [enabled]);
};
