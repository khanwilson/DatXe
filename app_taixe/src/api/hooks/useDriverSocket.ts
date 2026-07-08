// 1. IMPORTS
import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from 'api/socket/socketClient';

// 2. VARIABLES & TYPES
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
  };
  fare: number;
  expiresAt: string;
}

interface UseDriverSocketOptions {
  enabled: boolean;
  onNewOffer?: (payload: NewOfferPayload) => void;
}

// DEV mock: simulates a new_offer event when real socket is not available
const runDevMock = (onNewOffer?: (p: NewOfferPayload) => void) => {
  const timer = setTimeout(() => {
    console.debug('[DriverSocket] DEV mock: simulating new_offer event');
    onNewOffer?.({
      offerId: 'dev-offer-001',
      bookingId: 'dev-booking-001',
      pickup: {
        address: '120 Hai Ba Trung, Hanoi',
        lat: 21.0285,
        lng: 105.8542,
      },
      destination: {
        address: 'San bay Noi Bai, Hanoi',
      },
      fare: 150000,
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

    const handleNewOffer = (payload: NewOfferPayload) => {
      console.debug('[DriverSocket] Received new_offer:', payload.offerId);
      onNewOfferRef.current?.(payload);
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
