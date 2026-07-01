# Contract

**Task ID**: T-0051
**Phase**: Contracting
**Created**: 2026-07-01

---

## Scope

### In Scope

- Install `@rnmapbox/maps@10.3.1` in `app_user` (updates `package.json` + `bun.lock`)
- Register the `@rnmapbox/maps` Expo config plugin with `RNMapboxMapsDownloadToken` sourced from env, in `app.config.ts` (dynamic config — can read `process.env`)
- Add two env vars: `MAPBOX_DOWNLOAD_TOKEN` (`sk.`, build-time) and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (`pk.`, runtime) to `.env` + `.env.example`, with the pk/sk distinction documented
- Initialize the SDK at app entry: `Mapbox.setAccessToken(...)` at module scope in `app/_layout.tsx`
- Add Mapbox-compatible camera types/defaults in a **new** `src/constants/mapbox.ts` (`MapCamera` type, `DEFAULT_CAMERA` with GeoJSON `[lng, lat]` order)

### Out of Scope

- Migrating `AppMap` component logic to Mapbox (T-0052)
- Any edit to `AppMap.tsx`, `useCurrentLocation.ts`, `HomeScreen.tsx` (T-0052 consumers)
- Removing / rewriting `map.ts`'s `react-native-maps` `Region` exports (deferred to T-0052)
- Search / autocomplete (T-0053), route display (T-0054)
- Removing `react-native-maps` package (T-0056)
- app_taixe setup (T-0055)

---

## Allowed Files

```
app_user/package.json
app_user/bun.lock
app_user/app.config.ts
app_user/.env
app_user/.env.example
app_user/src/constants/mapbox.ts        (new)
app_user/app/_layout.tsx
```

**Rationale**: SDK install + native config plugin + two-token env setup + app-entry SDK init + a new additive constants file. No component logic touched — that is T-0052. `map.ts` intentionally left untouched to avoid breaking the three out-of-scope consumers.

---

## Impacted Projects

- [ ] app_taixe
- [x] app_user
- [ ] nestjs_prisma
- [ ] docs
- [ ] harness

---

## Acceptance Criteria

- [ ] `@rnmapbox/maps@10.3.1` installed and in `package.json`
- [ ] Config plugin registered with `RNMapboxMapsDownloadToken` from env in `app.config.ts`
- [ ] `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` read + `Mapbox.setAccessToken` called at app entry
- [ ] New Mapbox camera types/constants created (`src/constants/mapbox.ts`)
- [ ] `.env.example` documents both tokens with pk/sk distinction
- [ ] TypeScript compiles: `bunx tsc --noEmit`
- [ ] Lint passes: `bun lint`
- [ ] No out-of-scope files modified (AppMap / HomeScreen / useCurrentLocation / map.ts)
- [ ] No hard-coded tokens (env placeholders only)
- [ ] Tile render deferred to user manual dev-build (real tokens required)

---

## API Contract Changes

None. This task touches no backend endpoints or client API layer.

---

## Database Impact

None. No Prisma schema or migration changes.

---

## Test Strategy

- **Type check**: `bunx tsc --noEmit` — must pass.
- **Lint**: `bun lint` (`expo lint`) — must pass; `console.log` is an error.
- **Install sanity**: `@rnmapbox/maps` resolvable in `node_modules`, listed in `package.json`.
- **Edge case**: missing runtime token → `setAccessToken('')` does not crash init (tiles just fail to load).
- **Manual (user-run, real tokens)**: `expo prebuild` → dev build → render `<Mapbox.MapView>` and confirm tiles load. Cannot execute here (no tokens, no native build).

---

## Sign-off

- **Planner**: FRIDAYAIX (harness)
- **Code Owner**: nathan
- **Approved**: [ ] Yes / [ ] No
- **Approved At**: [Date]
