# Files Changed

**Task ID**: T-0034

---

## New

- `app_user/app.config.ts` — dynamic Expo config; injects Google Maps keys from env, extends app.json.
- `app_user/src/constants/map.ts` — `DEFAULT_REGION` (HCMC) + `FOCUSED_DELTA`.
- `app_user/src/components/map/useCurrentLocation.ts` — expo-location permission/position hook.
- `app_user/src/components/map/AppMap.tsx` — `MapView` wrapper (PROVIDER_GOOGLE) + recenter ref.
- `app_user/src/components/map/SearchPanel.tsx` — "Where to?" search bar + saved shortcuts (UI only).

## Modified

- `app_user/package.json` — `+ react-native-maps@1.20.1`.
- `app_user/bun.lock` — lockfile updated by install.
- `app_user/.env.example` — `GOOGLE_MAPS_ANDROID_API_KEY` / `GOOGLE_MAPS_IOS_API_KEY` (user-added).
- `app_user/app/(tabs)/HomeScreen.tsx` — rewritten: map + recenter FAB + search panel + denied banner.
- `app_user/src/localization/iLocalization.ts` — `home*` keys.
- `app_user/src/localization/resources/en.ts` — English strings.
- `app_user/src/localization/resources/vi.ts` — Vietnamese strings.

## Deviation from Allowed Files

- Hook placed at `src/components/map/useCurrentLocation.ts` instead of `src/hooks/useCurrentLocation.ts`
  because adding a `hooks/*` path needs `tsconfig.json` (not in Allowed Files). Stayed inside the
  allowed `src/components/map/**`. No out-of-scope files touched.

All other changes within the contract's Allowed Files.
