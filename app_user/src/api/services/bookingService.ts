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
  distance: number;
  estimated_duration: number;
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

const mockCreateBooking = async (_data: CreateBookingDto): Promise<{ success: boolean; data: BookingResponse }> => {
  await new Promise((r) => setTimeout(r, 600));
  return {
    success: true,
    data: {
      id: 'dev-booking-' + Date.now(),
      status: 'PENDING',
      pickup_address: _data.pickup_address,
      dropoff_address: _data.dropoff_address,
      vehicle_type: _data.vehicle_type,
      estimated_price: String(_data.estimated_price),
      created_at: new Date().toISOString(),
    },
  };
};

export const bookingService = {
  createBooking: (data: CreateBookingDto): Promise<{ success: boolean; data: BookingResponse }> => {
    if (__DEV__) return mockCreateBooking(data);
    return apiClient.post(ENDPOINTS.BOOKING.CREATE, data);
  },

  getBooking: (id: string): Promise<{ success: boolean; data: BookingResponse }> => {
    return apiClient.get(`${ENDPOINTS.BOOKING.GET}/${id}`);
  },
};
