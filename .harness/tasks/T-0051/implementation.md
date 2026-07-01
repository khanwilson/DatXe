# Implementation

**Task ID**: T-0051
**Phase**: Generating
**Created**: 2026-07-01
**Completed**: 2026-07-01

---

## Summary

Installed and configured `@rnmapbox/maps@10.3.1` in app_user as SDK setup/plumbing for the Mapbox migration. No map logic was migrated (that is T-0052) — this task installs the package, registers the Expo config plugin, wires the two-token env pattern, initializes the SDK at app entry, and adds additive Mapbox camera constants. `map.ts` and all T-0052 consumer files were left untouched.

---

## Changes Made

### Frontend - Customer App (app_user)

- Modified files:
  - `package.json` + `bun.lock` — added `@rnmapbox/maps@10.3.1`
  - `app.config.ts` — appended `@rnmapbox/maps` config plugin entry with `RNMapboxMapsDownloadToken` read from `MAPBOX_DOWNLOAD_TOKEN` env; Google Maps key injection left intact
  - `.env` + `.env.example` — added `MAPBOX_DOWNLOAD_TOKEN` (sk., build-time) and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (pk., runtime); pk/sk distinction documented in `.env.example`
  - `app/_layout.tsx` — `Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '')` at module scope
- Added files:
  - `src/constants/mapbox.ts` — `DEFAULT_CAMERA` (`centerCoordinate: [106.7009, 10.7769]` GeoJSON lng/lat, `zoomLevel: 14`) + `MapCamera` type

Implementation details:
- **Version**: `@rnmapbox/maps@10.3.1` (latest). Peer deps satisfied — `react-native >=0.79` (have 0.81), `expo >=47` (have 54). New Arch (Fabric) supported by 10.x.
- **Two-token model**: the download token (`sk.`) is a build-time secret consumed only by the config plugin during prebuild; the access token (`pk.`) is public and consumed by JS at runtime, hence `EXPO_PUBLIC_` prefix. They are deliberately kept separate.
- **Additive constants decision**: `map.ts` (Region-based, `react-native-maps`) left untouched to avoid breaking T-0052 out-of-scope consumers (`AppMap.tsx`, `HomeScreen.tsx`, `useCurrentLocation.ts`). New Mapbox camera type/default lives in a separate file.
- **Plugin placement**: entry added to the dynamic `app.config.ts` (which can read `process.env`), not static `app.json`, so the download token is injected from env and never committed.

### Database (Prisma)

- No changes.

---

## Code Quality Checks

- [x] ESLint: PASS (0 errors; 2 pre-existing warnings in untouched `src/utils/clearCache.ts`)
- [x] TypeScript: PASS (`tsc --noEmit` clean)
- [ ] Tests: N/A (no test runner in app_user)
- [ ] Build: deferred — native dev build requires real Mapbox tokens
- [x] No console.log left
- [x] No TODO comments left
- [x] No hard-coded secrets (tokens from env only)

---

## Notes

- Live tile render is a deferred acceptance criterion: requires real Mapbox tokens + `expo prebuild` + native dev build. Documented as a manual step for the user. Actual `<Mapbox.MapView>` wiring happens in T-0052.
- `react-native-maps` remains installed alongside `@rnmapbox/maps` during the migration window; removal is T-0056.
