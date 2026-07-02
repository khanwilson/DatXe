import { apiClient } from 'api/axios/client';
import { ApiResponse } from 'api/axios/common';
import { ENDPOINTS } from 'api/axios/config';

// 2. TYPES
export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetail {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  rating?: number;
}

export interface AutocompleteResponse {
  predictions: PlacePrediction[];
}

export interface PlaceDetailResponse {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  rating?: number;
}

export interface Destination {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export interface RouteLeg {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
}

export interface RouteGeometry {
  overview_polyline: {
    points: string;
  };
  legs: RouteLeg[];
}

export interface DirectionsResponse {
  routes: RouteGeometry[];
  summary: {
    totalDistance: { text: string; value: number };
    totalDuration: { text: string; value: number };
  };
}

// 3. SERVICE
export const goongPlaceService = {
  async autocomplete(
    query: string,
    language: string = 'vi'
  ): Promise<AutocompleteResponse> {
    const response = await apiClient.get<ApiResponse<{ data: AutocompleteResponse }>>(
      ENDPOINTS.ROUTES.AUTOCOMPLETE,
      {
        params: { query, language },
      }
    );
    console.log('Autocomplete response:', response.data); // Log the response data for debugging
    return response.data?.data;
  },

  async placeDetail(placeId: string): Promise<PlaceDetailResponse> {
    const response = await apiClient.get<ApiResponse<{ data: PlaceDetailResponse }>>(
      `${ENDPOINTS.ROUTES.PLACE_DETAIL}/${placeId}`
    );
    console.info('Place detail response:', response.data);
    return response.data?.data;
  },

  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: string = 'driving'
  ): Promise<DirectionsResponse> {
    const response = await apiClient.post<ApiResponse<{ data: DirectionsResponse }>>(
      ENDPOINTS.ROUTES.DIRECTIONS,
      {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode,
      }
    );
    return response.data?.data as DirectionsResponse;
  },
};
