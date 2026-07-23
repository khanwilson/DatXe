# Decisions: T-0076

## D1: Use summary text instead of step-by-step maneuvers

**Decision:** NavigationBanner displays `summary.totalDistance.text` and `summary.totalDuration.text` rather than per-step maneuver instructions.

**Reason:** The Goong Directions API responses in this codebase do not include `steps[]` with maneuver data. The summary fields are always available.

**Impact:** Banner shows overall route info rather than turn-by-turn. Acceptable for MVP; step-by-step can be added if API response is enriched later.

## D2: Hide bottom sheet when nav mode is active

**Decision:** When navigationMode is ON, the existing bottom sheet (pickup info / TripStatusSheet) is hidden.

**Reason:** Navigation overlays (banner + bottom bar) occupy the same screen real estate. Showing both would overlap and clutter. The toggle FAB remains visible to exit back to the sheet view.

## D3: Simple text icons for FAB

**Decision:** Used unicode text characters (triangle/X) for the nav toggle button instead of an icon component.

**Reason:** Avoids adding a new icon library dependency. The contract requires no new dependencies.

## D4: destinationAddress param fallback

**Decision:** ActiveTripScreen reads `destinationAddress` from route params with a coordinate-based fallback (`lat, lng`).

**Reason:** PickupNavigationScreen passes `destinationAddress` when navigating, but other entry points might not. The fallback ensures the banner always shows something meaningful.
