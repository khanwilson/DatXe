// 1. IMPORTS
import { useState, useCallback } from 'react';
import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

// 2. VARIABLES & TYPES
interface UseTripActionsResult {
  arrivedAtPickup: (tripId: string) => Promise<void>;
  startTrip: (tripId: string) => Promise<void>;
  completeTrip: (tripId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// 3. HOOK
export const useTripActions = (): UseTripActionsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const arrivedAtPickup = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.patch(ENDPOINTS.TRIP.DRIVER_ARRIVED(tripId));
    } catch (err) {
      setError('Failed to update arrived status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startTrip = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.patch(ENDPOINTS.TRIP.START(tripId));
    } catch (err) {
      setError('Failed to start trip');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTrip = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.patch(ENDPOINTS.TRIP.COMPLETE(tripId));
    } catch (err) {
      setError('Failed to complete trip');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { arrivedAtPickup, startTrip, completeTrip, loading, error };
};
