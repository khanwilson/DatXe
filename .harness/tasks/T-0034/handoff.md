# Handoff

**Task ID**: T-0034
**Title**: Home & map taxi search (app_user)
**Status**: Done (code) — runtime render pending user dev build
**Date**: 2026-06-29

---

## Summary

Built the app_user Home screen: a full-screen Google map (react-native-maps + PROVIDER_GOOGLE on
both platforms), current-location resolution with a recenter button, a "Where to?" search-bar
overlay with Home/Work shortcuts (UI only), and a non-blocking permission-denied banner. Added a
dynamic `app.config.ts` that injects Google Maps API keys from env.

## ⚠️ Action Required Before This Renders

1. **Fill real keys** in `app_user/.env`:
   - `GOOGLE_MAPS_ANDROID_API_KEY=...`
   - `GOOGLE_MAPS_IOS_API_KEY=...`
2. **Make a development build** (Expo Go no longer works — first native module):
   - `cd app_user && npx expo prebuild` then `npx expo run:ios` / `run:android`, or an EAS dev build.
   - For EAS, also set the two keys as EAS secrets/env so `app.config.ts` picks them up at build.
3. Map will not display until a valid key + dev build are in place. All code/config gates pass.

## Lessons Learned

- `react-native-maps@1.20.1` ships **no** Expo config plugin. The keys are read by prebuild from
  `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey`. Do **not** add
  `react-native-maps` to `plugins` — it would break prebuild.
- `app.config.ts` cleanly extends `app.json` via `({ config })` and reads `.env` (Expo auto-loads
  it at config eval). Build-time-only keys don't need the `EXPO_PUBLIC_` prefix.
- `dimensions` and `fontSize` are separate token scales — `p120` exists only on `fontSize`; the
  largest `dimensions` token is `p96`.

## Decisions

- **D-0006 (new)**: Map = react-native-maps + PROVIDER_GOOGLE on both iOS & Android; dev build
  required (leaves Expo Go). Keys via env + `app.config.ts`. See DECISIONS.md.
- Place-search (autocomplete/geocode against backend `/routes/*`) deferred to T-0035.
- `useCurrentLocation` co-located under `components/map/` rather than a new `src/hooks/` path
  (avoided a tsconfig edit outside the contract).

## API Changes

None. Backend `/routes/*` not yet consumed by app_user (lands in T-0035).

## Prisma Changes

None.

## Dependency Changes

- `+ react-native-maps@1.20.1` (app_user) — native map rendering. **Consequence: dev client / prebuild
  required; Expo Go unsupported from here on.**

## Reuse

- `AppMap`, `SearchPanel`, `useCurrentLocation`, `DEFAULT_REGION`/`FOCUSED_DELTA` are reusable for
  booking (T-0035), trip tracking (T-0036), and app_taixe map screens.

## Follow-ups

- T-0035: wire `SearchPanel.onPressSearch` → destination search using backend Places autocomplete +
  geocode; render pickup/dropoff markers + route polyline.
- Consider a custom Google Maps style (light/dark) to match Mai Linh theme.
- Add app_taixe equivalent when its map tasks start (same dependency + config pattern).
