export type TripStatus =
  | 'FINDING'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface DriverInfo {
  driverId: string;
  name: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  vehicleModel: string;
  plate: string;
  lat?: number;
  lng?: number;
}

// ponytail: kept for backward compat with useTripSimulation callers; remove when simulation is gone
export type MockDriver = DriverInfo;

export const MOCK_DRIVER: DriverInfo = {
  driverId: 'mock-driver-001',
  name: 'Nguyễn Văn Tài',
  avatar: 'https://i.pravatar.cc/150?img=12',
  rating: 4.9,
  vehicleModel: 'Toyota Vios',
  plate: '51A-678.90',
};

const BACKEND_STATUS_MAP: Record<string, TripStatus> = {
  DRIVER_EN_ROUTE: 'EN_ROUTE',
  DRIVER_ARRIVED: 'ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

export const backendStatusToTripStatus = (s: string): TripStatus | null =>
  BACKEND_STATUS_MAP[s] ?? null;

export const DRIVER_AVATAR_PLACEHOLDER = 'https://i.pravatar.cc/150?img=12';

// Timing for the simulated lifecycle (milliseconds).
export const TRIP_TIMING = {
  findingMs: 3000,
  arrivedMs: 3000,
  moveTickMs: 1000,
  enRouteSteps: 8,
};
