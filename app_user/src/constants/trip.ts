// Mock trip-tracking constants and types for app_user.
//
// Realtime driver assignment/location (T-0026/T-0028) and booking/trip APIs
// (T-0008/T-0010) are not implemented yet. Until then the active-trip screen
// simulates the ride lifecycle on the frontend. Keep this file the single source
// of truth for the mock so the WebSocket feed can replace `useTripSimulation`
// without touching the screen or the status sheet.

export type TripStatus =
  | 'FINDING'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface MockDriver {
  name: string;
  avatar: string;
  rating: number;
  vehicleModel: string;
  plate: string;
}

// Single mock driver used for every simulated ride.
export const MOCK_DRIVER: MockDriver = {
  name: 'Nguyễn Văn Tài',
  avatar: 'https://i.pravatar.cc/150?img=12',
  rating: 4.9,
  vehicleModel: 'Toyota Vios',
  plate: '51A-678.90',
};

// Timing for the simulated lifecycle (milliseconds).
export const TRIP_TIMING = {
  // Delay in FINDING before a driver is "assigned".
  findingMs: 3000,
  // Delay in ARRIVED before the trip starts moving to the destination.
  arrivedMs: 3000,
  // Interval between driver-marker position steps.
  moveTickMs: 1000,
  // Number of steps the driver takes to reach the pickup during EN_ROUTE.
  enRouteSteps: 8,
};
