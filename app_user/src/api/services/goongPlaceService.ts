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
    console.log('Place detail response:', response.data); // Log the response data for debugging
    return response.data?.data;
  },
};
