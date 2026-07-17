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
    const response = await apiClient.get<ApiResponse<AutocompleteResponse>>(
      ENDPOINTS.ROUTES.AUTOCOMPLETE,
      {
        params: { query, language },
      }
    );
    return response.data;
  },

  async placeDetail(placeId: string): Promise<PlaceDetailResponse> {
    const response = await apiClient.get<ApiResponse<PlaceDetailResponse>>(
      `${ENDPOINTS.ROUTES.PLACE_DETAIL}/${placeId}`
    );
    return response.data;
  },

  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: string = 'driving'
  ): Promise<DirectionsResponse> {
    try {
      const response = await apiClient.post<ApiResponse<DirectionsResponse>>(
        ENDPOINTS.ROUTES.DIRECTIONS,
        {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode,
        }
      );

      if (!response.data) {
        throw new Error('Invalid response from directions API');
      }

      const directionsData = response.data;

      if (!Array.isArray(directionsData.routes)) {
        directionsData.routes = [];
      }

      return directionsData;
    } catch (error) {
      console.error('Error in getDirections:', error);
      return {
        routes: [],
        summary: {
          totalDistance: { text: '', value: 0 },
          totalDuration: { text: '', value: 0 },
        },
      };
    }
  },
};
