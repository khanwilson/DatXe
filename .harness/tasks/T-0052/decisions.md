# T-0052 — Implementation Decisions

## D1: AppMapHandle renamed moveCamera (not animateToRegion)
Parameter is `MapCamera`, not `Region`. Truthful name prevents [lng,lat] flip mistakes at call sites.

## D2: LocationPuck for user dot (not PointAnnotation)
Built-in puck handles permission + rendering; removes the `userCoordinate` prop from AppMap entirely. Fallback to `PointAnnotation` if puck misbehaves in dev build (not implemented — contingency only).

## D3: constants/map.ts left on disk (not deleted)
`rm` was denied. File is dead (0 importers). Safe to delete manually: `rm app_user/src/constants/map.ts`.

## D4: [lng, lat] flip is explicit + commented at every conversion site
Both `useCurrentLocation` (setCamera) and `HomeScreen` (handleRecenter) have an inline comment marking the GeoJSON order flip. Prevents silent regression when reading the code later.

## D5: Camera defaultSettings for initial position (not animateCamera on mount)
`<Camera defaultSettings={...}>` is the idiomatic @rnmapbox way to set the starting viewport without triggering an animation on first render. Imperative `setCamera` is reserved for user-initiated moves.
