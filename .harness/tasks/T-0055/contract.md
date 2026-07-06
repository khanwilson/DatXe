# Contract — T-0055

**Phase**: Contracting  
**Task**: Frontend — Install & Configure @rnmapbox/maps (app_taixe)  
**Date**: 2026-07-06

---

## Scope

Install `@rnmapbox/maps@10.3.1` in app_taixe and wire up the same two-token SDK
initialisation pattern used in app_user (T-0051). No map UI components are
created; this is pure SDK setup.

## Out of Scope

- Map UI components, Camera, MapView, annotations (T-0041+)
- Driver-specific map features
- Any changes to app_user, nestjs_prisma
- Removing react-native-maps (T-0056)
- Migrating existing screens to Mapbox

## Allowed Files

```
app_taixe/package.json
app_taixe/bun.lock          (updated by bun add, not hand-edited)
app_taixe/app.config.ts     (NEW — dynamic config, replaces static app.json at build time)
app_taixe/src/constants/mapbox.ts  (NEW — MapCamera type + DEFAULT_CAMERA + FOCUSED_ZOOM)
app_taixe/app/_layout.tsx   (add Mapbox import + setAccessToken at module scope)
app_taixe/.env.example      (verify placeholders already present — edit only if missing)
app_taixe/.env              (verify placeholders already present — edit only if missing)
.harness/tasks/T-0055/      (all harness artifacts)
```

## Acceptance Criteria

- [ ] `@rnmapbox/maps@10.3.1` listed in `app_taixe/package.json#dependencies`
- [ ] `app_taixe/app.config.ts` exists, spreads `app.json`, appends `@rnmapbox/maps` plugin with `RNMapboxMapsDownloadToken` from `process.env.MAPBOX_DOWNLOAD_TOKEN`
- [ ] `app_taixe/src/constants/mapbox.ts` exports `MapCamera`, `DEFAULT_CAMERA`, `FOCUSED_ZOOM` (identical shape to app_user)
- [ ] `app_taixe/app/_layout.tsx` calls `Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '')` at module scope
- [ ] `.env.example` has `MAPBOX_DOWNLOAD_TOKEN=` and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=` placeholders
- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] Lint passes (`bun lint`)
- [ ] No existing screens or components broken

## Required Checks

```
cd app_taixe
bun lint
npx tsc --noEmit
```

## Implementation Constraints

- Use `@rnmapbox/maps@10.3.1` (exact version, same as app_user)
- `MAPBOX_DOWNLOAD_TOKEN` must NOT have `EXPO_PUBLIC_` prefix (build-time only)
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` must have `EXPO_PUBLIC_` prefix (runtime JS)
- `app.config.ts` must not inject Google Maps keys (app_taixe has no Google Maps)
- `app.config.ts` must spread all fields from `app.json` via `ConfigContext`
- `mapbox.ts` constants must be identical in shape to `app_user/src/constants/mapbox.ts`
- No comments added beyond the minimal header pattern used in app_user

---

**Status**: Accepted
