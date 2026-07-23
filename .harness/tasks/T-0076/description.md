# T-0076: Navigation Mode Button for Driver Screens

## Context
During the pickup approach (PickupNavigationScreen) and active trip (ActiveTripScreen), the driver sees a map with route overlay. They need a way to switch to real turn-by-turn navigation using a native maps app (Google Maps / Apple Maps).

## Requirement
Add a "Navigate" button on both PickupNavigationScreen and ActiveTripScreen that deep-links to the device's native navigation app with the correct destination coordinates pre-filled.

- PickupNavigationScreen: destination = pickup point coordinates
- ActiveTripScreen: destination = trip destination coordinates

## Technical Notes
- Mapbox SDK does not include turn-by-turn (paid separate product) — deep-link to native app is the standard approach
- Use `Linking.openURL` with platform-appropriate scheme (google maps / apple maps)
- No new dependencies needed — `react-native` Linking API covers this
- Button should be visible but not intrusive — a FAB or icon button on the map
