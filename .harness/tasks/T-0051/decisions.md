# Decisions (Task-Scoped)

**Task ID**: T-0051
**Date**: 2026-07-01

---

## Task-Scoped Decisions

### D-T-0051-1: Additive-only constants (do not rewrite map.ts)

| Field | Value |
|-------|-------|
| **Context** | Task text said "remove the `react-native-maps` `Region` type from `map.ts`", but `DEFAULT_REGION`/`FOCUSED_DELTA`/`Region` are consumed by three T-0052 out-of-scope files (`AppMap.tsx`, `HomeScreen.tsx`, `useCurrentLocation.ts`). |
| **Options Considered** | <ul><li>Rewrite `map.ts` destructively now (breaks 3 out-of-scope files)</li><li>Add new Mapbox constants in a separate file, leave `map.ts` intact</li><li>Edit all consumers too (violates contract scope)</li></ul> |
| **Decision** | Add `src/constants/mapbox.ts` (`DEFAULT_CAMERA`, `MapCamera`) alongside the untouched `map.ts`. |
| **Rationale** | Keeps T-0051 to pure SDK setup; lets T-0052 remove the `react-native-maps` `Region` dependency atomically when it migrates the consumers. Confirmed with user before contracting. |
| **Impact** | `map.ts` and all three consumers unchanged. Two constant files coexist until T-0052. |

### D-T-0051-2: Two-token split (pk runtime / sk build-time)

| Field | Value |
|-------|-------|
| **Context** | `@rnmapbox/maps` needs a secret download token at build time and a public access token at runtime. |
| **Decision** | `MAPBOX_DOWNLOAD_TOKEN` (sk., NOT `EXPO_PUBLIC_`, feeds plugin `RNMapboxMapsDownloadToken`) + `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (pk., consumed by `Mapbox.setAccessToken()` in JS). |
| **Rationale** | The `sk.` token must never ship in the JS bundle; only the `pk.` token is safe at runtime. Mirrors T-0034's build-time-key discipline. |
| **Impact** | Documented in `.env.example`. EAS builds must set both as secrets/env. Promoted to PROJECT_STATE.md. |

---

## Decisions to Promote

- [x] Mapbox as tile provider (supersedes D-0006 tile side) → promoted to `DECISIONS.md` as **D-0008** (per user: full promotion + decision).
