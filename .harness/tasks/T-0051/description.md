# T-0051: Frontend — Install & Configure @rnmapbox/maps (app_user)

**Status**: Planned  
**Priority**: P1  
**Projects**: app_user  
**Depends On**: —

---

## Description

Install and configure `@rnmapbox/maps` (Mapbox GL Native for React Native) in app_user to replace `react-native-maps` with Google provider. This task sets up the SDK, config plugin, environment variable injection, and verifies the map renders.

---

## Scope

### In Scope
- Install `@rnmapbox/maps` package
- Configure Expo config plugin in `app.config.ts` / `app.json`
- Add `MAPBOX_ACCESS_TOKEN` env var pattern (`.env`, `.env.example`)
- Initialize Mapbox SDK in app entry (token setup)
- Verify basic map renders (blank MapView with no markers)
- Update `src/constants/map.ts` to remove `react-native-maps` Region type dependency
- Create new type definitions for map region/camera compatible with Mapbox

### Out of Scope
- Migrating `AppMap` component logic (T-0052)
- Search/autocomplete integration (T-0053)
- Route display (T-0054)
- Removing `react-native-maps` package (T-0056)
- app_taixe setup (T-0055)

---

## Acceptance Criteria

- [ ] `@rnmapbox/maps` installed and listed in `package.json`
- [ ] Expo config plugin configured for Mapbox (iOS + Android native setup)
- [ ] `MAPBOX_ACCESS_TOKEN` read from env and injected at app init
- [ ] A test render of `<MapView>` from `@rnmapbox/maps` shows map tiles (dev build)
- [ ] New map types/constants created (`src/constants/map.ts` updated or new file)
- [ ] TypeScript compiles
- [ ] Lint passes
- [ ] `.env.example` documents the new token

---

## Technical Notes

### @rnmapbox/maps with Expo
- Requires Expo config plugin: `@rnmapbox/maps` ships one for managed workflow
- In `app.json` / `app.config.ts`:
  ```json
  {
    "plugins": [
      ["@rnmapbox/maps", {
        "RNMapboxMapsDownloadToken": "sk.xxx...",
        "RNMapboxMapsVersion": "11.x"
      }]
    ]
  }
  ```
- Download token (secret, `sk.`) goes in `.env` for build-time; public token (`pk.`) for runtime
- Requires `expo prebuild` (already the case since T-0034 removed Expo Go support)

### Initialization
```typescript
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
```

### Camera vs Region
- `react-native-maps` uses `Region` (lat, lng, latDelta, lngDelta)
- Mapbox uses `Camera` (centerCoordinate [lng, lat], zoomLevel, pitch, heading)
- Need adapter types in constants
