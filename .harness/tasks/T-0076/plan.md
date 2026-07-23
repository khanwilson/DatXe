# Plan: T-0076 — In-App Navigation Mode

## Goal

Add a "Navigation" toggle button on `PickupNavigationScreen` and `ActiveTripScreen` that switches the map from **overview mode** (bounds-fit, static camera) to **navigation mode** (camera follows driver, bearing rotation, 3D pitch, maneuver banner).

This keeps the driver inside the app during pickup approach and active trip — no deep-link to external maps.

## Proposed Approach

### Navigation Mode Components

1. **Camera follow mode** — When nav mode is ON:
   - `followUserLocation: true`
   - `followPitch: 45` (3D tilt like Waze)
   - `followZoomLevel: 17` (closer zoom)
   - `animationMode: 'easeTo'` (smooth transitions)
   - Camera rotates so "up" = driving direction

2. **Maneuver banner** — Top bar showing:
   - Maneuver icon (turn-left, turn-right, merge, etc.)
   - Distance to next step (e.g., "180m")
   - Street name (e.g., "Duy Tân")
   - Data from Goong Directions `steps[]`

3. **Bottom bar** — Shows:
   - ETA + remaining distance (from Goong `summary`)
   - "Re-center" button (re-locks camera to driver)
   - "Overview" button (exits nav mode, returns to bounds-fit)

4. **Toggle button** — Floating button on map to enter/exit nav mode:
   - Icon: compass/navigation arrow
   - Position: top-right (opposite of back button)

### Implementation Steps

1. **Create `NavigationBanner` component** (`components/navigation/NavigationBanner.tsx`):
   - Renders maneuver icon + distance + street name
   - Props: `step: GoongStep | null`, `distance: number`

2. **Create `NavigationBottomBar` component** (`components/navigation/NavigationBottomBar.tsx`):
   - Shows ETA, distance, Re-center/Overview buttons
   - Props: `eta: string`, `distance: string`, `onRecenter: () => void`, `onOverview: () => void`

3. **Update `AppMap` component** (`components/map/AppMap.tsx`):
   - Add `navigationMode: boolean` prop
   - When `navigationMode=true`: configure camera for follow mode with pitch/zoom/bearing
   - When `navigationMode=false`: use bounds-fit mode (current behavior)

4. **Update both screens**:
   - `PickupNavigationScreen.tsx`:
     - Add `navigationMode` state (default: false)
     - Add toggle button (top-right FAB)
     - Render `NavigationBanner` when nav mode ON (destination = pickup coords)
     - Render `NavigationBottomBar` when nav mode ON
     - Pass `navigationMode` to `AppMap`
   - `ActiveTripScreen.tsx`:
     - Same as above, but destination = trip destination coords
     - Only show toggle during `ARRIVED` and `IN_PROGRESS` states

### Data Source

- Goong Directions API already returns `steps[]` with:
  - `maneuver.type` (turn-left, turn-right, merge, etc.)
  - `distance` (meters to next step)
  - `name` (street name)
  - `instruction` (HTML text)
- `summary.totalDuration.text` (ETA)
- `summary.totalDistance.text` (total distance)

### UI Reference

See `assets/waze-navigation-reference.png` for target visual style.

## Files Changed

| File | Action |
|------|--------|
| `app_taixe/src/components/navigation/NavigationBanner.tsx` | Create — maneuver banner |
| `app_taixe/src/components/navigation/NavigationBottomBar.tsx` | Create — bottom bar with ETA + controls |
| `app_taixe/src/components/map/AppMap.tsx` | Edit — add navigationMode prop + camera config |
| `app_taixe/app/PickupNavigationScreen.tsx` | Edit — add nav mode state + toggle + components |
| `app_taixe/app/ActiveTripScreen.tsx` | Edit — add nav mode state + toggle + components |

## What We Can Build (≈80% of Waze visual)

✅ Maneuver banner (icon + distance + street name)
✅ Driver position + heading arrow (already have LocationPuck)
✅ Camera follow + bearing rotation + 3D pitch
✅ Route polyline (already have LineLayer)
✅ Street name labels (from Goong steps[].name)
✅ Re-center / Overview toggle
✅ ETA + distance remaining
✅ Remaining route trimming (already implemented)

## What We Cannot Do (Without Additional SDK/Service)

❌ Traffic/camera/incident icons (no free data source in Vietnam)
❌ Lane guidance (not in Goong API)
❌ Speed limit display (no data source)
❌ Real-time traffic coloring (no traffic flow data)

See `assets/capability-analysis.md` for detailed breakdown.

## Out of Scope (Phase 2)

- Voice guidance (can add with `expo-speech`)
- Auto-reroute when driver goes off-route (custom logic needed)
- Traffic data integration (requires paid service)

## Risks

- Camera follow mode may feel jarring if GPS updates are inconsistent (emulator vs real device)
- Maneuver banner needs to advance steps correctly as driver progresses (distance threshold logic)
- No new dependencies — all from existing Mapbox + Goong stack
