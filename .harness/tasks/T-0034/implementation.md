# Implementation

**Task ID**: T-0034
**Phase**: Generating → Closing

---

## Changes Made

### 1. Dependency
- `bunx expo install react-native-maps` → `react-native-maps@1.20.1` (SDK 54 / RN 0.81 / New Arch compatible). Lockfile updated.
- Confirmed v1.20.1 ships **no** Expo config plugin → keys are read natively by Expo prebuild from `ios.config.googleMapsApiKey` / `android.config.googleMaps.apiKey` (do NOT add `react-native-maps` to `plugins`).

### 2. `app.config.ts` (new — dynamic config)
- Extends static `app.json` via `({ config })`. Injects Google Maps keys from `process.env.GOOGLE_MAPS_ANDROID_API_KEY` / `GOOGLE_MAPS_IOS_API_KEY`.
- Keys are build-time only → intentionally NOT `EXPO_PUBLIC_`-prefixed; never committed.
- Verified: `npx expo config --json` with test env → keys land in resolved config; `name`/`slug`/`newArch` from app.json preserved.

### 3. `.env.example`
- Already seeded by user with `GOOGLE_MAPS_ANDROID_API_KEY=` / `GOOGLE_MAPS_IOS_API_KEY=` (placeholders).

### 4. `src/constants/map.ts` (new)
- `DEFAULT_REGION` (HCMC District 1, ~3km span) fallback before GPS / on denial.
- `FOCUSED_DELTA` tighter zoom once precise location known.

### 5. `src/components/map/useCurrentLocation.ts` (new hook)
- Wraps `expo-location`: requests foreground permission, gets current position, exposes `{ region, coordinate, status, request() }`.
- Non-blocking: always returns a usable region (fallback on denied / error). `status: idle|loading|granted|denied`.
- **Deviation**: placed under `components/map/` not `src/hooks/` — adding a `hooks/*` tsconfig path was out of the contract's Allowed Files. Co-located with the map components it serves.

### 6. `src/components/map/AppMap.tsx` (new)
- `forwardRef` wrapper over `MapView` with `provider={PROVIDER_GOOGLE}`, `showsUserLocation`, custom user dot marker.
- Exposes `AppMapHandle.animateToRegion` via `useImperativeHandle` for the recenter button.

### 7. `src/components/map/SearchPanel.tsx` (new)
- Bottom card: "Where to?" pressable search bar + Home/Work saved-place shortcuts (static UI).
- `onPressSearch` / `onPressShortcut` callbacks — destination search wiring deferred to T-0035.

### 8. `app/(tabs)/HomeScreen.tsx` (rewrite)
- Full-screen `AppMap` + recenter FAB + `SearchPanel` overlay + non-blocking permission-denied banner with re-request button.
- Uses `useCurrentLocation`; recenter animates to coordinate or re-requests if no fix.

### 9. i18n
- Added `homeWhereTo`, `homeSavedHome`, `homeSavedWork`, `homeLocationDenied`, `homeEnableLocation` to `iLocalization.ts`, `en.ts`, `vi.ts`.

---

## Verification

- `npx tsc --noEmit` → 0 errors (fixed initial `p120` dimension typo → `p96 + p48`; `p120` is a fontSize token only).
- `bun lint` → 0 errors (2 pre-existing warnings in unrelated `clearCache.ts`).
- `npx expo config` → merge valid; env keys inject into iOS + Android config.
- Hardcoded color / API-key grep over new files → none.
