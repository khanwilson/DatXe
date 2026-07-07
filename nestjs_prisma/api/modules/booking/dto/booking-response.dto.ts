export class BookingResponseDto {
  id: string;
  customer_id: string;
  driver_id?: string | null;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  dropoff_address: string;
  vehicle_type?: string | null;
  distance?: number | null;
  estimated_price: string;
  final_price?: string | null;
  estimated_duration?: number | null;
  actual_distance?: number | null;
  note?: string | null;
  cancelled_at?: Date | null;
  cancel_reason?: string | null;
  created_at: Date;
  updated_at: Date;
}
