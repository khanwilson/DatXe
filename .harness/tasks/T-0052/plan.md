# T-0052 — Plan: Migrate AppMap Component to Mapbox (app_user)

## 1. Analysis

### Goal
Replace the `react-native-maps` (Google) implementation inside `AppMap` and its
supporting modules with `@rnmapbox/maps` (installed in T-0051), while keeping the
HomeScreen behaviour identical from the user's point of view: full-screen map,
user location, recenter FAB, HCMC fallback.

### Affected files
| File | Current role | Change |
|------|--------------|--------|
| `app_user/src/components/map/AppMap.tsx` | `MapView`/`Marker`/`PROVIDER_GOOGLE`, imperative `animateToRegion(Region)` | Rewrite on `Mapbox.MapView` + `Camera` + `LocationPuck`; new imperative API on a camera model |
| `app_user/src/components/map/useCurrentLocation.ts` | Returns `Region` + `coordinate`, uses `DEFAULT_REGION`/`FOCUSED_DELTA` | Return a Mapbox camera + `coordinate`; drop `react-native-maps` import |
| `app_user/src/constants/map.ts` | `DEFAULT_REGION: Region`, `FOCUSED_DELTA`, imports `Region` from react-native-maps | Remove `react-native-maps` import; either delete file or reduce to plain lat/lng consts (see §3.3) |
| `app_user/app/(tabs)/HomeScreen.tsx` | Calls `animateToRegion({...coordinate, ...FOCUSED_DELTA})`, imports `FOCUSED_DELTA` | Switch to new camera-based recenter call; drop `FOCUSED_DELTA` import |

### Already in place (T-0051)
- `@rnmapbox/maps@10.3.1` installed, `Mapbox.setAccessToken(...)` in `app/_layout.tsx`.
- `app_user/src/constants/mapbox.ts` provides `MapCamera` type,
  `DEFAULT_CAMERA = { centerCoordinate: [106.7009, 10.7769], zoomLevel: 14 }`,
  and `FOCUSED_ZOOM = 16`.

### Complexity: Medium
Contained to 4 files, no backend/API/Prisma involvement. The real work is the
coordinate-model translation (Region ↔ Camera) and the `@rnmapbox` component API
(`Camera` ref-driven animation vs. `MapView.animateToRegion`).

### Risks
- **Coordinate order bug** — Mapbox is `[lng, lat]`; react-native-maps was
  `{latitude, longitude}`. Every conversion must flip. Highest-probability defect.
- **Camera animation API** — `@rnmapbox` animates via the `Camera` component
  (`cameraRef.setCamera(...)` or props), not via a `MapView` method. The
  imperative handle must drive the `Camera` ref, not the `MapView` ref.
- **User location** — prefer built-in `LocationPuck` (blue dot) over a manual
  Marker; requires location permission already handled by `useCurrentLocation`.
  Keep a custom marker fallback only if the puck proves unreliable.
- **Native module not in Expo Go** — build already dev-client per memory
  (`app-user-requires-dev-build`). Runtime verification needs a dev build; static
  checks (tsc/lint) are the gate for this task.
- **Cannot remove `react-native-maps`** — deferred to T-0056. Leave the package in
  `package.json`; only remove *imports* from the three map modules.

## 2. Step-by-step implementation

1. **`constants/map.ts`** — remove the `Region` import (kills the last
   `react-native-maps` import in constants). Decide fate per §3.3: reduce to a
   neutral `HCMC_FALLBACK` coordinate + delete `FOCUSED_DELTA`, or delete the file
   entirely and rely on `constants/mapbox.ts`. Preferred: **delete `map.ts`** and
   route all consumers to `constants/mapbox.ts`, since `mapbox.ts` already carries
   the fallback (`DEFAULT_CAMERA`) and focused zoom (`FOCUSED_ZOOM`).

2. **`useCurrentLocation.ts`** — swap `Region` for the Mapbox model:
   - Import `DEFAULT_CAMERA`, `FOCUSED_ZOOM`, `MapCamera` from `constants/mapbox`.
   - State: `camera: MapCamera` (init `DEFAULT_CAMERA`) + `coordinate?: { latitude; longitude }` (unchanged shape — it's the domain coordinate, not a map type).
   - On fix: `setCoordinate(next)` and
     `setCamera({ centerCoordinate: [next.longitude, next.latitude], zoomLevel: FOCUSED_ZOOM })`.
   - Return `{ camera, coordinate, status, request }`.
   - Remove all `react-native-maps` and `constants/map` imports.

3. **`AppMap.tsx`** — rewrite the render + handle:
   - Imports: `Mapbox, { Camera, LocationPuck, MapView }` from `@rnmapbox/maps`; `MapCamera` from `constants/mapbox`.
   - Props: `camera: MapCamera` (initial), `userCoordinate?` kept (used only if we
     render a manual marker; otherwise droppable — see §3.2).
   - Handle: `AppMapHandle.moveCamera(camera: MapCamera, duration?)` (renamed from
     `animateToRegion`) that calls `cameraRef.current?.setCamera({ centerCoordinate, zoomLevel, animationDuration })`.
   - Render `MapView` (style `StyleSheet.absoluteFill`, `scaleBarEnabled={false}`,
     `compassEnabled={false}`, Mapbox Streets style URL / default), a `Camera` with
     `defaultSettings={{ centerCoordinate, zoomLevel }}` (or `ref` for imperative),
     and `<LocationPuck puckBearingEnabled visible />` for the user dot.
   - Keep the `stylesSheet(theme)` factory + `useMemo` pattern; drop the manual
     `userDotOuter/Inner` styles if `LocationPuck` replaces them.

4. **`HomeScreen.tsx`**:
   - Destructure `{ camera, coordinate, status, request }` from `useCurrentLocation`.
   - Pass `<AppMap ref={mapRef} camera={camera} />` (drop `region`; keep/remove
     `userCoordinate` per §3.2).
   - `handleRecenter`: if `coordinate` present →
     `mapRef.current?.moveCamera({ centerCoordinate: [coordinate.longitude, coordinate.latitude], zoomLevel: FOCUSED_ZOOM })`; else `request()`.
   - Replace `FOCUSED_DELTA` import from `constants/map` with `FOCUSED_ZOOM` from
     `constants/mapbox`.

5. **Static verification** — `bun lint` + `tsc` (see §4). Fix all findings.

## 3. Interface design decisions

### 3.1 `AppMapHandle`
Rename `animateToRegion` → **`moveCamera(camera: MapCamera, duration?: number)`**.
Rationale: the parameter is no longer a Region and the underlying call targets the
Camera, not the MapView. A truthful name prevents the "flip the coordinates"
mistake at every call site. Signature:

```ts
export interface AppMapHandle {
  // Smoothly fly the camera to a target (used by the recenter button).
  moveCamera: (camera: MapCamera, duration?: number) => void;
}
```

### 3.2 User location rendering — `userCoordinate` prop
Prefer `@rnmapbox`'s built-in **`LocationPuck`** for the blue dot. That makes
`userCoordinate` redundant for *rendering*. Decision: **drop `userCoordinate` from
`IAppMapProps`** and let `LocationPuck` handle the dot; the domain `coordinate`
still lives in HomeScreen for the recenter target. If `LocationPuck` misbehaves in
the dev build, fall back to a `PointAnnotation`/`ShapeSource` marker fed by
`userCoordinate` — noted as the contingency, not the default.

### 3.3 `constants/map.ts`
It only exists to serve the react-native-maps Region model. Once consumers move to
`constants/mapbox.ts`, it has no callers. Decision: **delete `constants/map.ts`**.
`DEFAULT_CAMERA` (fallback) and `FOCUSED_ZOOM` in `mapbox.ts` fully replace
`DEFAULT_REGION` and `FOCUSED_DELTA`. Confirm no other importers before deleting:
grep `constants/map` and `DEFAULT_REGION`/`FOCUSED_DELTA` across `app_user/src`
and `app_user/app`. If an out-of-scope importer exists, downgrade to "reduce file
to a neutral lat/lng constant with no react-native-maps import" instead of delete,
and flag before touching that file (per CLAUDE.md rule 3).

### 3.4 `useCurrentLocation` return shape
Return **`{ camera: MapCamera, coordinate?, status, request }`**. Keep `coordinate`
as the plain `{ latitude, longitude }` domain value (not a map-lib type) so
HomeScreen owns the flip to `[lng, lat]` when it builds a camera. `camera` is the
render-ready initial/fallback camera for `AppMap`.

## 4. Testing strategy
- No test runner configured (`app_user/CLAUDE.md`) → unit tests are **skipped**;
  log the skip in evaluation.
- **Typecheck**: `cd app_user && npx tsc --noEmit` — must be clean (catches the
  Region→Camera type migration and any dangling `react-native-maps` import).
- **Lint**: `cd app_user && bun lint` — must pass (Husky pre-commit runs it; no
  `console.log`, absolute imports only, English comments).
- **Grep gate**: confirm zero `react-native-maps` references remain in
  `AppMap.tsx`, `useCurrentLocation.ts`, and (if kept) `constants/map.ts`; confirm
  no dangling `DEFAULT_REGION`/`FOCUSED_DELTA`/`FOCUSED_DELTA` imports.
- **Runtime (manual, dev build)**: out of scope for automated gate but list as
  acceptance evidence — map renders full-screen, blue puck at user location,
  camera starts at user (HCMC fallback when denied), recenter FAB flies back.

## 5. Effort estimate
- Coding: ~1.5–2 h (4 files, one new component API + coordinate translation).
- Verification (tsc + lint + grep): ~15–30 min.
- **Total: ~2–2.5 h.** Low cross-project blast radius (app_user only, no backend).

## 6. Out of scope (guardrails)
- Do NOT remove `react-native-maps` from `package.json` (T-0056).
- Do NOT add search / autocomplete (T-0053) or route rendering (T-0054).
- Do NOT touch `app_taixe` or `nestjs_prisma`.
- Do NOT modify files outside the four listed without stopping to ask (CLAUDE.md §3).
