# Plan

**Task ID**: T-0051
**Phase**: Planning
**Created**: 2026-07-01

---

## Analysis

### Scope Clarification

- Affected Projects: `app_user` only
- Affected Files (new): `src/constants/mapbox.ts` (Mapbox camera types/defaults — additive, see key insight)
- Affected Files (edit): `package.json` (+lockfile via `bun add`), `app.json` (register plugin baseline) OR `app.config.ts` (inject download token into plugin), `.env`, `.env.example`, `app/_layout.tsx` (SDK token init), `src/constants/map.ts` (additive Mapbox constant, non-breaking)
- Estimated Complexity: Medium (native SDK + config plugin + two-token setup; verification needs a dev build)

### Key Architectural Insight — map.ts scope tension

The task text says "update `map.ts` to remove the `react-native-maps` `Region` type" and "create new types for region/camera". But `DEFAULT_REGION` / `FOCUSED_DELTA` / the `Region` type are consumed by **three files that are explicitly T-0052 out-of-scope**:
- `src/components/map/useCurrentLocation.ts`
- `src/components/map/AppMap.tsx`
- `app/(tabs)/HomeScreen.tsx`

Rewriting `map.ts` destructively now would break all three and force edits outside this contract.

**Decision**: This task is **additive-only** for constants. Add a new Mapbox-native camera default (`DEFAULT_CAMERA` with `centerCoordinate: [lng, lat]`, `zoomLevel`) in a new `src/constants/mapbox.ts`, leaving `map.ts`'s `Region`-based exports untouched. T-0052 removes the `react-native-maps` `Region` dependency when it migrates the three consumers. This satisfies the SDK-setup intent of T-0051 without breaking out-of-scope files.

### Dependencies

- Previous Tasks: T-0034 (established react-native-maps + dev-build model + app.config.ts env-injection pattern), D-0006 (maps decision — now being superseded on the tile provider side)
- External Dependencies: `@rnmapbox/maps@10.3.1` (latest; peer deps `react-native >=0.79` ✓ 0.81, `expo >=47` ✓ 54), Mapbox account with **two tokens**: a secret **download token** (`sk.`, build-time) and a public **access token** (`pk.`, runtime)
- Blocked By: nothing

### Risks

- **R1: Runtime vs build-time token confusion.** `Mapbox.setAccessToken()` runs in JS at runtime → needs the `pk.` token available to JS → must be `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`. The `sk.` download token is build-time only (config plugin `RNMapboxMapsDownloadToken`) and must **never** be `EXPO_PUBLIC_`. → Mitigation: two distinct env vars, documented in `.env.example` with the pk/sk distinction called out.
- **R2: Cannot fully verify tile render without real tokens + native rebuild.** `.env` will hold placeholders; a real map-tile render requires a Mapbox token and `expo prebuild` + dev build on device/simulator. → Mitigation: verify install/config/typecheck/lint statically; document the manual dev-build smoke test as a follow-up the user runs with real tokens (mirrors T-0050's caveat).
- **R3: New Arch (Fabric) compatibility.** app_user has `newArchEnabled: true`. → Mitigation: `@rnmapbox/maps@10.x` supports New Arch; no interop-layer flag needed. Confirm at build time.
- **R4: Two map SDKs installed simultaneously.** `react-native-maps` stays installed (removal is T-0056) alongside `@rnmapbox/maps`. → Mitigation: acceptable and expected during migration; they don't conflict at the JS layer. No shared native singletons touched in this task.
- **R5: Plugin placement.** Download token comes from env, so the `@rnmapbox/maps` plugin entry with `RNMapboxMapsDownloadToken` must live in the **dynamic** `app.config.ts` (which can read `process.env`), not static `app.json`. → Mitigation: append the plugin entry to `config.plugins` inside `app.config.ts`.

---

## Implementation Approach

### Step 1: Install the SDK
`bun add @rnmapbox/maps@10.3.1` in `app_user`. Updates `package.json` + `bun.lock`.

### Step 2: Config plugin (app.config.ts)
Append `['@rnmapbox/maps', { RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN }]` to the spread `config.plugins` array in `app.config.ts`. Keep the existing Google Maps key injection intact (removal is T-0056). Leave `app.json` plugins as the static baseline.

### Step 3: Env vars
- `.env` + `.env.example`: add `MAPBOX_DOWNLOAD_TOKEN=` (sk., build-time) and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=` (pk., runtime). Document the pk/sk distinction in `.env.example`.

### Step 4: SDK token init (app/_layout.tsx)
At module scope (top of the entry layout), call `Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '')`. This is the documented app-entry init point.

### Step 5: Additive Mapbox constants (src/constants/mapbox.ts)
New file: `DEFAULT_CAMERA` (`{ centerCoordinate: [106.7009, 10.7769], zoomLevel: 14 }` — HCMC D1, GeoJSON lng/lat order) + a small `MapCamera` type. `map.ts` untouched.

### Step 6 (optional, if a quick static render check is cheap): a throwaway `<MapView>` is NOT added to a route — rendering tiles requires the dev build, so the actual render is a documented manual step, not code left in the tree.

---

## Testing Strategy

- Type check: `bunx tsc --noEmit` — must pass.
- Lint: `bun lint` (Husky/lint-staged uses `expo lint`) — must pass; watch the `console.log` rule.
- Install sanity: `@rnmapbox/maps` present in `package.json` deps + resolvable in `node_modules`.
- Manual (documented, user-run with real tokens): `expo prebuild` → dev build → render a `<Mapbox.MapView>` and confirm tiles load. Cannot be done here without tokens + native build.
- Edge cases: missing `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` → `setAccessToken('')` no crash at init (tiles just won't load); documented.

---

## Estimated Effort

- Planning: 30 min
- Implementation: ~45 min
- Verification: ~20 min (static only; dev-build render deferred to user)
- Total: ~1.5 h

---

## Acceptance Criteria

- [ ] `@rnmapbox/maps` installed and in `package.json`
- [ ] Config plugin registered with `RNMapboxMapsDownloadToken` from env (in `app.config.ts`)
- [ ] `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` read + `Mapbox.setAccessToken` called at app entry
- [ ] New Mapbox camera types/constants created (`src/constants/mapbox.ts`); `map.ts` left non-breaking
- [ ] `.env.example` documents both tokens with pk/sk distinction
- [ ] TypeScript compiles
- [ ] Lint passes
- [ ] No out-of-scope files (AppMap/HomeScreen/useCurrentLocation) modified
- [ ] Tile render verified manually via dev build (deferred to user — real tokens required)
