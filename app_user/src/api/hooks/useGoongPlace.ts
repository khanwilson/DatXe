import { useQuery } from '@tanstack/react-query';
import { goongPlaceService } from 'api/services/goongPlaceService';

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
    queryFn: async () => {
      // Additional safety check before calling the service
      if (!origin || !destination) {
        throw new Error('Origin or destination is missing');
      }

      try {
        const originCoords = parseLatLng(origin);
        const destCoords = parseLatLng(destination);

        // Validate coordinates
        if (isNaN(originCoords.lat) || isNaN(originCoords.lng) ||
            isNaN(destCoords.lat) || isNaN(destCoords.lng)) {
          throw new Error('Invalid coordinates');
        }

        const directions = await goongPlaceService.getDirections(originCoords, destCoords);

        // Validate response data
        if (!directions || !Array.isArray(directions.routes)) {
          throw new Error('Invalid directions response');
        }

        return directions;
      } catch (error) {
        console.error('Error fetching directions:', error);
        throw error;
      }
    },
    enabled: !!origin && !!destination && origin.includes(',') && destination.includes(','),
    staleTime: 5 * 60 * 1000,
  });
};
