// Mapbox-native map constants for app_user.
//
// Mapbox uses a Camera model (centerCoordinate + zoomLevel) instead of the
// react-native-maps Region model (lat/lng + deltas). Coordinates follow the
// GeoJSON order: [longitude, latitude].
//
// These are additive: the react-native-maps constants in ./map.ts stay in place
// until T-0052 migrates the AppMap/HomeScreen/useCurrentLocation consumers.

export interface MapCamera {
  // GeoJSON order: [longitude, latitude].
  centerCoordinate: [number, number];
  zoomLevel: number;
}

// Fallback camera used before GPS resolves or when location permission is
// denied. Centered on Ho Chi Minh City (District 1). zoomLevel 14 ≈ the ~3km
// span DEFAULT_REGION targeted in the react-native-maps constants.
export const DEFAULT_CAMERA: MapCamera = {
  centerCoordinate: [106.7009, 10.7769],
  zoomLevel: 14,
};

// Tighter zoom applied once the user's precise location is known.
export const FOCUSED_ZOOM = 16;
