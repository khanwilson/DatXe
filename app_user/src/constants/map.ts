// Map-related constants for app_user.

import { Region } from 'react-native-maps';

// Fallback map region used before GPS resolves or when location permission is
// denied. Centered on Ho Chi Minh City (District 1).
export const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  // ~3km span — close enough to feel "local" before GPS narrows it.
  latitudeDelta: 0.0322,
  longitudeDelta: 0.0221,
};

// Tighter zoom applied once the user's precise location is known.
export const FOCUSED_DELTA = {
  latitudeDelta: 0.0122,
  longitudeDelta: 0.0084,
};
