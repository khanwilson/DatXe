import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

export interface CreateBookingDto {
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  dropoff_address: string;
  vehicle_type: string;
  estimated_price: number;
}

export interface BookingResponse {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  vehicle_type: string;
  estimated_price: string;
  created_at: string;
}

export const bookingService = {
  createBooking: (data: CreateBookingDto): Promise<{ success: boolean; data: BookingResponse }> => {
    return apiClient.post(ENDPOINTS.BOOKING.CREATE, data);
  },

  getBooking: (id: string): Promise<{ success: boolean; data: BookingResponse }> => {
    return apiClient.get(`${ENDPOINTS.BOOKING.GET}/${id}`);
  },
};
