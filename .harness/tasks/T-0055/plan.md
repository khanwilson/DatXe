# Plan — T-0055: Frontend — Install & Configure @rnmapbox/maps (app_taixe)

**Status**: Awaiting approval  
**Phase**: Planning  
**Model**: claude-sonnet-4-6

---

## Goal

Mirror the exact T-0051 setup (app_user) into app_taixe:
- Install `@rnmapbox/maps@10.3.1`
- Create `app.config.ts` (app_taixe has only `app.json`)
- Add Mapbox constants file
- Wire `Mapbox.setAccessToken()` in the root layout
- Add/update env vars

No map UI components. No existing screens touched.

---

## Context

- app_user completed this as T-0051 (2026-07-01); the pattern is proven.
- app_taixe currently has **no** `app.config.ts` — only `app.json`. A new dynamic config file must be created.
- `src/constants/` contains only `enum.ts`; `mapbox.ts` does not exist yet.
- `app/_layout.tsx` has no Mapbox import or token init.
- `.env.example` already has `MAPBOX_DOWNLOAD_TOKEN` and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` placeholders (added at some point), but no `.env` file exists — both need to be confirmed/created.
- app_taixe does NOT have Google Maps keys in `app.json` (unlike app_user), so the `app.config.ts` is simpler: only inject the Mapbox download token.

---

## Approach

Additive only. No existing file's logic is changed; new code is appended or new files are created.

### Step 1 — Install package

```bash
cd app_taixe && bun add @rnmapbox/maps@10.3.1
```

### Step 2 — Create `app_taixe/app.config.ts`

Dynamic config that:
- Spreads `config` from `app.json`
- Reads `MAPBOX_DOWNLOAD_TOKEN` from env
- Appends the `@rnmapbox/maps` plugin to the existing plugins array with `RNMapboxMapsDownloadToken`

No Google Maps keys (app_taixe has none).

### Step 3 — Create `app_taixe/src/constants/mapbox.ts`

Identical to app_user's version:
- `MapCamera` interface (`centerCoordinate: [number, number]`, `zoomLevel: number`)
- `DEFAULT_CAMERA` — Ho Chi Minh City District 1 `[106.7009, 10.7769]`, zoomLevel 14
- `FOCUSED_ZOOM = 16`

### Step 4 — Update `app_taixe/app/_layout.tsx`

Add at module scope (before the component):
```typescript
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '');
```

No other changes to `_layout.tsx`.

### Step 5 — Verify `.env.example`

`.env.example` already has both Mapbox placeholder lines. Confirm they match the expected format; no change needed if correct.

### Step 6 — Checks

```bash
cd app_taixe && bun run lint
cd app_taixe && npx tsc --noEmit
```

---

## Files to Touch

| File | Action |
|------|--------|
| `app_taixe/package.json` | Updated by `bun add` |
| `app_taixe/bun.lock` | Updated by `bun add` |
| `app_taixe/app.config.ts` | **NEW** — dynamic Expo config |
| `app_taixe/src/constants/mapbox.ts` | **NEW** — Mapbox camera constants |
| `app_taixe/app/_layout.tsx` | Edit — add Mapbox import + setAccessToken |
| `app_taixe/.env.example` | Verify only (already has placeholders) |

**NOT touched**: any existing screen, component, hook, or other source file.

---

## Risk

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Peer dep mismatch | Low | `@rnmapbox/maps@10.3.1` was verified against RN 0.81 / Expo 54 in T-0051; same versions here |
| `app.config.ts` + `app.json` conflict | Low | Expo merges them; the config spread pattern is standard |
| TypeScript error on `process.env.*` | Low | `expo-env.d.ts` is already checked in; `EXPO_PUBLIC_*` vars are typed there |

---

## Acceptance Criteria Mapping

| Criterion | How Met |
|-----------|---------|
| `@rnmapbox/maps` installed | Step 1 |
| Expo config plugin configured | Step 2 (`app.config.ts`) |
| `MAPBOX_ACCESS_TOKEN` readable from env | Step 4 (`EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`) |
| Mapbox SDK initialized on startup | Step 4 (`setAccessToken` at module scope) |
| TypeScript compiles | Step 6 |
| Lint passes | Step 6 |
| No breaking changes to existing screens | Additive-only approach |

---

## Out of Scope

- Map UI components (future T-0041+)
- Map view screen rendering
- Driver-specific map features
- Modifying any existing screen or component
