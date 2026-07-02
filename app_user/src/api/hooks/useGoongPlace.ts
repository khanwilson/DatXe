import { useQuery } from '@tanstack/react-query';
import { goongPlaceService } from 'api/services/goongPlaceService';

export const GOONG_PLACE_KEYS = {
  autocomplete: (query: string) => ['goong', 'autocomplete', query] as const,
  placeDetail: (placeId: string) => ['goong', 'placeDetail', placeId] as const,
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
