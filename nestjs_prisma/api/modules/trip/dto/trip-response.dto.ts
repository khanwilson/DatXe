export class TripResponseDto {
  id: string;
  booking_id: string;
  driver_id: string;
  customer_id: string;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  route_polyline?: string | null;
  start_odometer?: number | null;
  end_odometer?: number | null;
  actual_distance?: number | null;
  actual_duration?: number | null;
  started_at?: Date | null;
  completed_at?: Date | null;
  cancelled_at?: Date | null;
  cancel_reason?: string | null;
  created_at: Date;
  updated_at: Date;
}
