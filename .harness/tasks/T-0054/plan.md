# T-0054 Plan — Route Display with Mapbox Directions Layer (app_user)

**Phase**: Planning
**Model**: claude-sonnet-4-6 (single-module frontend task, no architecture boundary — no Opus escalation, no Architect)
**Depends On**: T-0050 (backend Goong `/routes/directions`, Done), T-0052 (AppMap on Mapbox, Done)

---

## 1. Goal

After the user picks a destination on `SearchDestinationScreen` (T-0053), draw the driving
route on the Home map: fetch directions from the backend, decode the polyline, render it as a
Mapbox line layer, drop origin + destination markers, fit the camera to the route, and show a
distance/ETA summary card.

## 2. Requirements (from description.md acceptance criteria)

- Route polyline rendered on map after a destination is selected
- Origin marker at the user's current location; destination marker at the selected place
- Camera auto-fits to the full route with padding
- Summary card shows distance (km) + duration (min)
- Loading state while fetching; error state if the fetch fails
- Polyline styled with `theme.color.map.route`
- TypeScript compiles; lint passes

## 3. Verified context

**Backend** `POST /routes/directions` (T-0050, already live) returns:
```
{ success, data: {
    routes: [{ overview_polyline: { points: "<encoded>" }, legs: [{ distance:{text,value}, duration:{text,value} }], ... }],
    summary: { totalDistance: {text,value}, totalDuration: {text,value} }
} }
```
Request body: `{ origin: "lat,lng", destination: "lat,lng", mode: "driving" }`.
Frontend unwrap pattern (from `goongPlaceService`): `apiClient.post<ApiResponse<{data:T}>>` → `response.data?.data`.

**Origin** = `useCurrentLocation().coordinate` (`{latitude, longitude}`, undefined until GPS fix).
**Destination** = `ZustandSession.selectedDestination` (`{lat, lng, name, address}`), currently read in a
`useFocusEffect` in `HomeScreen` at line 24-34 (the `// TODO` at line 28 is the integration point).

**Polyline decoding**: `@mapbox/polyline` is **not installed** — needs adding (dependency change,
logged per CLAUDE.md rule 9). Decode returns `[lat,lng][]` → map to GeoJSON `[lng,lat]`.

**Theme**: `theme.color.map.route` (`#00843D`), `map.pinStart`, `map.pinEnd` already exist — no new tokens.

**`@rnmapbox/maps@10.3.1`** supports `ShapeSource` + `LineLayer` (route) and `PointAnnotation`/`MarkerView` (markers), and `Camera` with `bounds` for fit.

## 4. Proposed approach

### 4.1 API layer
- `config.ts`: add `ROUTES.DIRECTIONS = '/routes/directions'`.
- `goongPlaceService.ts`: add `getDirections(origin, destination, mode?)` returning a typed
  `DirectionsResponse`; add `DirectionsResponse` / `RouteSummary` types. Follow the existing
  `response.data?.data` unwrap. **No `console.log`** (existing two console.logs are out of scope —
  will not touch them beyond what's needed; lint rule allows `.info` but I add none).
- `useGoongPlace.ts`: add `useDirections(origin, destination, mode?)` `useQuery` hook mirroring
  `usePlaceDetail`, `enabled` only when both origin and destination are present; add key to
  `GOONG_PLACE_KEYS`.

### 4.2 Polyline util
- Add `@mapbox/polyline` dependency (+ `@types/@mapbox/polyline` if needed).
- Add `src/utils/functions/decodePolyline.ts`: wrap `polyline.decode` → `[lng,lat][]` (GeoJSON order)
  and a `getBounds(coords)` helper returning `{ne,sw}` for camera fit.

### 4.3 AppMap component
- Extend `IAppMapProps` with optional `route?: [number,number][]`, `origin?: [number,number]`,
  `destination?: [number,number]`.
- Render, as children of `MapView`: `ShapeSource` + `LineLayer` (styled `theme.color.map.route`,
  width 5, round cap/join) when `route` present; `PointAnnotation`/`MarkerView` markers for
  origin (`map.pinStart`) and destination (`map.pinEnd`).
- Add optional `bounds?: {ne,sw}` prop → pass to `MapboxGL.Camera` so parent can fit to route
  (keeps camera control centralized in the existing Camera ref).

### 4.4 HomeScreen wiring
- Replace the `useFocusEffect` `// TODO`: store `selectedDestination` in local state instead of only
  logging; keep clearing session after read.
- Build `origin` from `coordinate`; call `useDirections`.
- Decode `data.routes[0].overview_polyline.points` → pass to `AppMap` route/markers/bounds.
- Render a summary card (distance `summary.totalDistance.text`, duration `summary.totalDuration.text`)
  using theme tokens + `AppText`; loading indicator while fetching; error text on failure.
- All new strings via `localization` (`en.ts` + `vi.ts`) — **needs Allowed Files entry**.

## 5. Files to touch (candidate Allowed Files — finalized in contract)

- `app_user/src/api/axios/config.ts`
- `app_user/src/api/services/goongPlaceService.ts`
- `app_user/src/api/hooks/useGoongPlace.ts`
- `app_user/src/components/map/AppMap.tsx`
- `app_user/app/(tabs)/HomeScreen.tsx`
- `app_user/src/utils/functions/decodePolyline.ts` (new)
- `app_user/src/localization/en.ts`, `app_user/src/localization/vi.ts` (route summary / error strings)
- `app_user/package.json` + `bun.lock` (add `@mapbox/polyline`)

## 6. Risks

- **Polyline field**: backend passes Goong routes through; assumes `overview_polyline.points` exists
  (Goong returns it, Google-compatible). If absent, fall back to `legs[].steps[].polyline` — will
  verify against the transformed shape during implementation; if the field is missing entirely, stop.
- **New dependency** (`@mapbox/polyline`): touches lockfile — logged in evaluation + handoff per rule 9.
- **Markers on `@rnmapbox/maps@10.3.1`**: `PointAnnotation` vs `MarkerView` API — will use the
  version-correct one; no native rebuild needed (JS-only layers).
- **Camera fit vs LocationPuck recenter**: route-fit bounds must not fight the existing recenter FAB;
  bounds applied only while a route is shown.

## 7. Out of scope

Turn-by-turn nav, alternative routes, real-time trip updates (T-0036), booking confirmation (T-0035).

## 8. Architect / escalation

Not required. Single module (app_user), no architecture boundary, no cross-project contract change
(consumes an existing backend endpoint). Default Sonnet planning; Implementing on Opus per routing.
