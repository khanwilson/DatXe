# Handoff

**Task ID**: T-0055  
**Title**: Frontend — Install & Configure @rnmapbox/maps (app_taixe)  
**Completed**: 2026-07-06  
**Duration**: ~30 min

---

## Summary

Installed and configured `@rnmapbox/maps@10.3.1` in app_taixe, mirroring the T-0051 pattern from app_user. Config plugin wired via a new `app.config.ts` (app_taixe had none before), runtime SDK init via `Mapbox.setAccessToken()` at module scope in `_layout.tsx`, and additive Mapbox camera constants in `src/constants/mapbox.ts`. No map component logic added (future driver map tasks will use this foundation).

---

## What Was Delivered

- `@rnmapbox/maps@10.3.1` installed (peer deps satisfied: RN 0.81.5 ≥ 0.79, Expo 54 ≥ 47).
- `app.config.ts` created — dynamic config spreading `app.json` and appending the `@rnmapbox/maps` plugin with `MAPBOX_DOWNLOAD_TOKEN`. Simpler than app_user (no Google Maps keys in app_taixe).
- `src/constants/mapbox.ts` — `MapCamera` type, `DEFAULT_CAMERA` (HCMC District 1, GeoJSON `[lng, lat]`), `FOCUSED_ZOOM: 16`.
- `app/_layout.tsx` — `Mapbox` import + `setAccessToken(EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN)` at module scope.
- `.env.example` — already had correct placeholders (verified, no change needed).

---

## API Changes

None.

---

## Database Changes

None.

---

## Files Changed

| File | Action |
|------|--------|
| `app_taixe/package.json` | Added `@rnmapbox/maps@10.3.1` to dependencies |
| `app_taixe/bun.lock` | Updated by `bun install` |
| `app_taixe/app.config.ts` | NEW — dynamic Expo config with Mapbox plugin |
| `app_taixe/src/constants/mapbox.ts` | NEW — MapCamera type + DEFAULT_CAMERA + FOCUSED_ZOOM |
| `app_taixe/app/_layout.tsx` | Added Mapbox import + setAccessToken call |

---

## Evaluation

- Lint: PASS (0 errors)
- Typecheck: PASS on all task-touched files (pre-existing errors in OnBoardingScreen.tsx unrelated)

---

## Next Steps

- Future driver map tasks (T-0041+, T-0043+, T-0044+) can now import `@rnmapbox/maps` and use `DEFAULT_CAMERA` from `constants/mapbox`.
- Populate `MAPBOX_DOWNLOAD_TOKEN` (sk.) and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (pk.) in `.env` and run `expo prebuild` before testing on device.

## Security

- No secrets committed. Both tokens are env-only; `.env` is gitignored.
- `sk.` download token never enters the JS bundle (no `EXPO_PUBLIC_` prefix).

---

## Final Status

DONE
