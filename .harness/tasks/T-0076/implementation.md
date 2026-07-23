# Implementation: T-0076

## Summary

Added in-app navigation mode to both PickupNavigationScreen and ActiveTripScreen. When toggled ON, the map switches to a follow-camera with 3D pitch (45 degrees), closer zoom (17), and bearing rotation. A top banner shows distance/duration to destination, and a bottom bar shows ETA with re-center/overview controls. The existing bottom sheet (pickup info or trip status) hides during navigation mode to maximize map visibility.

## Files Changed

| File | Change | Reason |
|---|---|---|
| `app_taixe/src/components/map/AppMap.tsx` | Camera config uses navigationMode prop with followUserLocation, followPitch=45, followZoomLevel=17, easeTo animation | Switches map to navigation-style camera when toggled |
| `app_taixe/app/PickupNavigationScreen.tsx` | Added nav toggle FAB (top-right), NavigationBanner + NavigationBottomBar overlays, navigationMode state/handlers, passes prop to AppMap | Driver can enter nav mode while approaching pickup |
| `app_taixe/app/ActiveTripScreen.tsx` | Same nav mode UI, restricted to ARRIVED/IN_PROGRESS states only, added destinationAddress param | Driver can enter nav mode during active trip phases |
| `app_taixe/src/components/navigation/NavigationBanner.tsx` | Created (prior session) | Top banner showing distance, duration, destination name |
| `app_taixe/src/components/navigation/NavigationBottomBar.tsx` | Created (prior session) | Bottom bar with ETA, distance, re-center/overview buttons |

## Implementation Decisions

- When navigation mode is ON, the existing bottom sheet (pickup info or TripStatusSheet) is hidden to give the map maximum screen real estate. The toggle FAB remains visible to exit nav mode.
- ActiveTripScreen toggle is only shown during ARRIVED and IN_PROGRESS statuses per contract requirements.
- Used simple text symbols for the FAB icon (triangle up / X) rather than adding an icon library dependency.

## Notes for Evaluation

- Typecheck passes clean (`bun tsc --noEmit`)
- Lint passes with 0 errors, 0 warnings on task files
- Camera follow mode uses `followUserLocation: true` which relies on real GPS updates -- on emulator the camera will lock to the simulated location but won't rotate bearing without real movement
- No new dependencies added

## Status
Implemented

---

## Fix Round 1 (Evaluation FAIL_FIXABLE)

### Problem
NavigationBanner used route summary data (totalDistance/totalDuration) instead of per-step maneuver data from Goong `steps[]`. The acceptance criterion requires: "NavigationBanner renders maneuver icon, distance, and street name from Goong steps[]".

### Root Cause
The frontend `RouteGeometry` type does not declare `steps`, but the backend passes Goong's raw response which includes `legs[0].steps[]` with `instruction`, `distance.text`, and `duration.text` per step.

### Fix Applied
1. **NavigationBanner.tsx** — rewrote props interface to accept `instruction` (raw HTML step text), `stepDistance` (e.g. "180m"), and `destinationName` (fallback). Added `getManeuverIcon()` to parse keywords (left/right/straight/merge/roundabout/u-turn) into directional symbols. Added `stripHtml()` to clean Goong's HTML-tagged instruction text.

2. **PickupNavigationScreen.tsx** — added `routeSteps` memo that casts `directionsData.routes[0]` as `any` and extracts `legs[0].steps[]`. Added `currentStepIndex` memo that maps the driver's fake `step` position proportionally onto the steps array. Passes `instruction` and `stepDistance` to NavigationBanner, with summary fallback if steps unavailable.

3. **ActiveTripScreen.tsx** — same pattern, uses `tripStep` for proportional index mapping.

### Verification
- `cd app_taixe && npx tsc --noEmit` — passes (0 errors)
- `cd app_taixe && bun lint` — 0 errors, 0 warnings on task files (pre-existing warnings in other files unchanged)
