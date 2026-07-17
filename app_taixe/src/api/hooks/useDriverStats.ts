import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';
import type { ApiResponse } from 'api/axios/common';
export interface DashboardStats {
  isOnline: boolean;
  tripsToday: number;
  earningsToday: number;
}

export const DRIVER_STATS_KEYS = ['driver', 'stats'] as const;

export function useDriverStats(enabled = true) {
  return useQuery({
    queryKey: DRIVER_STATS_KEYS,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<DashboardStats>>(ENDPOINTS.DRIVER.GET_STATS);
      console.debug('[useDriverStats] raw res:', JSON.stringify(res));
      return res.data;
    },
    enabled,
  });
}
