# Handoff

**Task ID**: T-0051
**Title**: Frontend — Install & Configure @rnmapbox/maps (app_user)
**Completed**: 2026-07-01
**Duration**: ~1.5 h

---

## Summary

Installed and configured `@rnmapbox/maps@10.3.1` in app_user: config plugin wired to a build-time download token, runtime SDK init via a public access token, and additive Mapbox camera constants. No map component logic was migrated (that is T-0052) and no out-of-scope files were touched.

---

## What Was Delivered

- `@rnmapbox/maps@10.3.1` installed (peer deps satisfied: RN 0.81 ≥ 0.79, Expo 54 ≥ 47, New Arch supported).
- `@rnmapbox/maps` Expo config plugin appended in `app.config.ts` with `RNMapboxMapsDownloadToken` from `MAPBOX_DOWNLOAD_TOKEN`.
- Two env vars added + documented (`.env`, `.env.example`) with the pk/sk distinction.
- `Mapbox.setAccessToken()` called at module scope in `app/_layout.tsx`.
- New `src/constants/mapbox.ts` — `DEFAULT_CAMERA` (GeoJSON `[lng, lat]`) + `MapCamera` type.

---

## API Changes

None. This is a frontend SDK-setup task; no backend endpoints touched.

---

## Database Changes

None.

---

## Lessons Learned

### What Went Well
- Verifying `@rnmapbox/maps@10.3.1` peer deps against the npm registry before planning avoided a version-compat guess.
- Additive-constants approach kept the task inside its contract with zero out-of-scope edits.

### What Was Challenging
- The task text implied a destructive `map.ts` rewrite that would have broken three T-0052 files → resolved by confirming the additive approach with the user before contracting.

### What We'd Do Differently
- Nothing significant; the two-token split and additive strategy are the clean path.

---

## Next Steps

### Immediate Next Tasks
1. **T-0052** — Migrate `AppMap` to Mapbox: swap `MapView`/`Marker`/`Region` for `Mapbox.MapView`/`Camera`/`PointAnnotation`, migrate `useCurrentLocation` + `HomeScreen` to `DEFAULT_CAMERA`, and remove the `react-native-maps` `Region` import from `map.ts`.
2. **T-0055** — Same SDK setup for app_taixe (reuses this task's pattern).

### Known Technical Debt
- Two map SDKs (`react-native-maps` + `@rnmapbox/maps`) coexist until T-0056 removes Google. Priority: Medium.
- Live tile render not yet verified (needs real tokens + dev build). Priority: High (blocks T-0052 visual work).

---

## Testing Coverage

- Typecheck: PASS. Lint: PASS (0 errors). No test runner in app_user.
- Manual dev-build tile render: **deferred to user** (real Mapbox tokens + `expo prebuild` required).

---

## Security Review

- [x] No hard-coded secrets — both tokens are placeholders in `.env`; real values via env/EAS secrets.
- [x] `sk.` download token is NOT `EXPO_PUBLIC_` (never enters JS bundle).
- [x] Only `pk.` public token exposed to runtime JS (safe by Mapbox design).

---

## Deployment Notes

### Prerequisites
- Set `MAPBOX_DOWNLOAD_TOKEN` (sk.) and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (pk.) in `.env` locally and as EAS secrets/env for builds.

### Deployment Steps
1. Populate both Mapbox tokens.
2. `expo prebuild` (regenerates native projects with the Mapbox plugin).
3. Dev build on device/simulator; confirm tiles render.

### Rollback Plan
- `bun remove @rnmapbox/maps`, revert `app.config.ts` plugin entry, `_layout.tsx` init, env vars, and delete `src/constants/mapbox.ts`. `map.ts` and all consumers are untouched, so rollback is isolated.

---

## File Changes Summary

- **Projects Modified**: app_user
- **Total Files Changed**: 6 (1 new, 5 edited) + lockfile
- See `files-changed.md` for details.

---

## Approvals

- **Task Owner**: nathan
- **Approved**: 2026-07-01
