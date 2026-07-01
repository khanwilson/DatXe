# T-0052 — Implementation Notes

## Summary

Migrated `AppMap`, `useCurrentLocation`, and `HomeScreen` from `react-native-maps` to `@rnmapbox/maps`. All four contracted files touched; `constants/map.ts` is now dead (no importers) but left on disk pending manual delete or user approval.

---

## Changes Made

### `app_user/src/components/map/AppMap.tsx` — Full rewrite
- Replaced `MapView`/`Marker`/`PROVIDER_GOOGLE` imports with `@rnmapbox/maps` `MapView`, `Camera`, `LocationPuck`.
- Props: `{ camera: MapCamera }` (dropped `region: Region` and `userCoordinate`).
- Handle: `AppMapHandle.moveCamera(camera, duration?)` driving `cameraRef.current?.setCamera(...)`.
- User dot: `<LocationPuck puckBearingEnabled />` replaces manual `Marker` + `userDotOuter/Inner` styles.
- Camera initialized via `Camera` `defaultSettings`; imperative animation via ref.
- `stylesSheet(theme)` factory pattern preserved; dropped `userDotOuter/Inner` entries.

### `app_user/src/components/map/useCurrentLocation.ts` — Return model swap
- State: `camera: MapCamera` (init `DEFAULT_CAMERA`) + `coordinate?` (unchanged shape).
- On fix: `setCamera({ centerCoordinate: [next.longitude, next.latitude], zoomLevel: FOCUSED_ZOOM })` — explicit `[lng, lat]` flip documented inline.
- Returns `{ camera, coordinate, status, request }` — no `Region`, no `react-native-maps` import.
- Imports from `constants/mapbox` only.

### `app_user/app/(tabs)/HomeScreen.tsx` — Handle + props update
- Destructures `{ camera, coordinate, status, request }` from `useCurrentLocation`.
- `<AppMap ref={mapRef} camera={camera} />` — `region` and `userCoordinate` props removed.
- `handleRecenter`: calls `mapRef.current?.moveCamera({ centerCoordinate: [coordinate.longitude, coordinate.latitude], zoomLevel: FOCUSED_ZOOM })` with explicit flip comment.
- Replaced `FOCUSED_DELTA` import (from `constants/map`) with `FOCUSED_ZOOM` import (from `constants/mapbox`).

### `app_user/src/constants/map.ts` — Dead (no importers)
- All consumers migrated to `constants/mapbox`. File has zero importers.
- **Not deleted** — `rm` was denied during implementation. Manual delete or re-approve required.
- Contents are dead code; safe to `rm app_user/src/constants/map.ts` at any time.

---

## Verification

- `tsc --noEmit`: **PASS** (0 errors)
- `bun lint`: **PASS** (0 errors; 2 pre-existing warnings in `clearCache.ts`, unrelated)
- Grep `react-native-maps` in map components: **0 matches**
- Grep `constants/map` outside map files: **0 matches**
- Runtime (dev build): deferred — needs real Mapbox tokens + `expo prebuild`
