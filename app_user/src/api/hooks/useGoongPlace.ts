import { useQuery } from '@tanstack/react-query';
import { goongPlaceService, DirectionsResponse } from 'api/services/goongPlaceService';

export const GOONG_PLACE_KEYS = {
  autocomplete: (query: string) => ['goong', 'autocomplete', query] as const,
  placeDetail: (placeId: string) => ['goong', 'placeDetail', placeId] as const,
  directions: (origin: string, destination: string) => ['goong', 'directions', origin, destination] as const,
};

export const useAutocomplete = (query: string) => {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: GOONG_PLACE_KEYS.autocomplete(normalizedQuery),
    queryFn: async () => {
      return goongPlaceService.autocomplete(normalizedQuery);
    },
    enabled: normalizedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlaceDetail = (placeId: string | null) => {
  return useQuery({
    queryKey: GOONG_PLACE_KEYS.placeDetail(placeId ?? ''),
    queryFn: () => goongPlaceService.placeDetail(placeId!),
    enabled: !!placeId,
    staleTime: 60 * 60 * 1000,
  });
};

// origin/destination are "lat,lng" strings
const parseLatLng = (value: string): { lat: number; lng: number } => {
  const [lat, lng] = value.split(',').map(Number);
  return { lat, lng };
};

export const useDirections = (origin: string | null, destination: string | null) => {
  return useQuery({
    queryKey: GOONG_PLACE_KEYS.directions(origin ?? '', destination ?? ''),
    queryFn: () => goongPlaceService.getDirections(parseLatLng(origin!), parseLatLng(destination!)),
    enabled: !!origin && !!destination,
    staleTime: 5 * 60 * 1000,
  });
};
