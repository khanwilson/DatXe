# Navigation Capability Analysis: Mapbox + Goong

Reference: `waze-navigation-reference.png` (Waze turn-by-turn UI screenshot)

## What We Can Build (≈80% of Waze visual)

### 1. Maneuver Banner (top bar)
- **Waze:** "← 180m Duy Tân" — icon + distance + street name
- **We have:** Goong Directions returns `steps[]` with:
  - `maneuver.type` (turn-left, turn-right, merge, etc.)
  - `distance` (meters to next step)
  - `name` (street name)
  - `instruction` (HTML text)
- **Verdict:** ✅ Full equivalent. Build a banner component from step data.

### 2. Driver Position + Heading Arrow
- **Waze:** Blue arrow showing car position + direction
- **We have:** `MapboxGL.LocationPuck puckBearingEnabled visible` already in AppMap
- **Verdict:** ✅ Already implemented. The puck rotates with device heading.

### 3. Camera Follow + Bearing Rotation
- **Waze:** Camera follows car, rotates so "up" = driving direction, slight 3D pitch
- **We have:** Mapbox Camera supports `followUserLocation`, `followPitch`, `followZoomLevel`, `animationMode`
- **Verdict:** ✅ Supported. Need to configure camera for navigation mode (pitch ~45°, zoom ~17, bearing follow).

### 4. Route Polyline
- **Waze:** Purple highlighted route, faded behind driver
- **We have:** `LineLayer` with `routeGeoJSON` already rendering route
- **Verdict:** ✅ Already implemented. Can style differently for nav mode (thicker, different color).

### 5. Street Name Labels on Route
- **Waze:** "Duy Tân", "Phạm Hùng" labels on the route
- **We have:** Goong `steps[].name` gives street names per segment
- **Verdict:** ✅ Can render as annotations at step waypoints.

### 6. Re-center / Overview Toggle + ETA
- **Waze:** Bottom bar with "Re-center", "Overview", "18 min · 5.8 km"
- **We have:** Goong `summary.totalDuration.text` + `summary.totalDistance.text`
- **Verdict:** ✅ Build as a bottom bar component. Toggle between follow-mode and bounds-fit mode.

### 7. Remaining Route Trimming
- **Waze:** Route ahead is bright, route behind is faded
- **We have:** `remainingRoute` useMemo already slices route from current position forward
- **Verdict:** ✅ Already implemented in both screens.

## What We Can Approximate (Good Enough for MVP)

### 8. Voice Guidance
- **Waze:** "Rẽ trái sau 180m" spoken aloud
- **We have:** `expo-speech` package (free, no native code needed)
- **Verdict:** 🟡 Can add later. Not in scope for this task. Simple TTS of step instructions.

### 9. Auto-Reroute (Off-route Detection)
- **Waze:** Detects when driver deviates, recalculates route
- **We have:** GPS location from `useCurrentLocation`, Goong Directions API
- **Verdict:** 🟡 Can build: compare driver position to route polyline, if distance > threshold → call directions API again. Requires logic but no new SDK.

## What We Cannot Do (Without Additional SDK/Service)

### 10. Traffic / Camera / Incident Icons
- **Waze:** Yellow warning icons, traffic light icons, speed camera icons
- **We have:** Nothing. Goong free tier does not provide traffic/incident data.
- **Verdict:** ❌ No free source in Vietnam. Would need paid traffic data provider or community-sourced data.

### 11. Lane Guidance
- **Waze:** Shows which lane to be in at upcoming junction
- **We have:** Goong Directions does not return lane information
- **Verdict:** ❌ Not available from Goong. Mapbox Directions API has it but requires Mapbox token with navigation scope (paid).

### 12. Speed Limit Display
- **Waze:** Speed limit sign overlay
- **We have:** No speed limit data from Goong
- **Verdict:** ❌ Not available. Would need separate speed limit dataset.

### 13. Real-time Traffic Coloring
- **Waze:** Route segments colored red/yellow/green based on traffic
- **We have:** No traffic flow data
- **Verdict:** ❌ Cannot replicate without traffic data source.

## Summary

| Feature | Status |
|---------|--------|
| Maneuver banner (icon + distance + street) | ✅ Full |
| Driver arrow + heading | ✅ Full |
| Camera follow + bearing + pitch | ✅ Full |
| Route polyline | ✅ Full |
| Street name labels | ✅ Full |
| Re-center / Overview toggle | ✅ Full |
| ETA + distance remaining | ✅ Full |
| Remaining route trimming | ✅ Full |
| Voice guidance |  Add later (expo-speech) |
| Auto-reroute | 🟡 Add later (custom logic) |
| Traffic/camera/incident icons | ❌ No data source |
| Lane guidance | ❌ Not in Goong |
| Speed limit display | ❌ No data source |
| Traffic-colored route | ❌ No data source |

**Conclusion:** We can build a navigation mode that looks ~80% like Waze's visual UI using only Mapbox tiles + Goong directions. The missing 20% is traffic/incident data (no free source) and lane guidance. For a driver app helping tài xế navigate to pickup/dropoff, the 80% is sufficient.
