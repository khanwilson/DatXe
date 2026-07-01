# T-0055: Frontend — Install & Configure @rnmapbox/maps (app_taixe)

**Status**: Planned  
**Priority**: P2  
**Projects**: app_taixe  
**Depends On**: T-0051

---

## Description

Install and configure `@rnmapbox/maps` in app_taixe. Since drivers will eventually use map view (T-0041+, T-0043+, T-0044+), set up the same foundation as we did for app_user (T-0051).

This is a prerequisite for future driver map work, but won't show any maps in the UI yet.

---

## Scope

### In Scope
- Install `@rnmapbox/maps` package in app_taixe
- Configure Expo config plugin in `app.config.ts` / `app.json`
- Add `MAPBOX_ACCESS_TOKEN` env var pattern (`.env`, `.env.example`)
- Initialize Mapbox SDK in app entry (token setup)
- No actual map components to render yet (T-0041+ will do that)

### Out of Scope
- Creating map UI components (future driver tasks)
- Map view screen rendering
- Driver-specific map features

---

## Acceptance Criteria

- [ ] `@rnmapbox/maps` installed in app_taixe
- [ ] Expo config plugin properly configured for native builds
- [ ] `MAPBOX_ACCESS_TOKEN` can be read from env
- [ ] Mapbox SDK initialized on app startup
- [ ] TypeScript compiles
- [ ] Lint passes
- [ ] No breaking changes to existing app_taixe screens/features

---

## Technical Notes

Same config/setup pattern as T-0051 (app_user):

### In `app.json`
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

### In app entry point
```typescript
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
```
