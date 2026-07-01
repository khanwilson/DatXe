# Decisions (Task-Scoped)

**Task ID**: T-0050
**Date**: 2026-07-01

---

## Task-Scoped Decisions

### D-T-0050-1: Adapter pattern to preserve API contract

| Field | Value |
|-------|-------|
| **Context** | `RoutesService.transform*()` and all DTOs read Google-shaped response fields. Task requires the provider to swap while `/routes/*` contract stays unchanged. |
| **Options Considered** | <ul><li>Rewrite `RoutesService.transform*` for Goong shapes</li><li>Make `GoongService` an adapter that normalizes Goong → Google shape</li><li>Change DTOs to Goong-native shapes</li></ul> |
| **Decision** | `GoongService` acts as an adapter: normalizes every Goong response back into the Google-compatible shape `RoutesService` already consumes. |
| **Rationale** | Zero edits to `RoutesService` transforms, `RoutesController`, or DTOs. Smallest blast radius, satisfies "contract unchanged" exactly. |
| **Impact** | `RoutesService` needs only the injected dependency swapped. Isolates all Goong-specific shape knowledge in one file. |

### D-T-0050-2: Reject `transit` mode

| Field | Value |
|-------|-------|
| **Context** | Goong supports only car/bike/taxi; DTO `mode` enum is `driving\|walking\|transit`. |
| **Options Considered** | <ul><li>Silently fall back transit→car</li><li>Reject transit with a clear error</li><li>Remove transit from DTO enum (out of scope)</li></ul> |
| **Decision** | Reject `transit` at the service layer with a clear error → surfaces as 400 via controller. (User-confirmed.) |
| **Rationale** | Silent fallback hides intent and returns misleading routes. Explicit rejection is honest. DTO enum left unchanged (out of scope to alter). |
| **Impact** | `mapVehicle('transit')` throws; `driving→car`, `walking→bike`. |

### D-T-0050-3: Bump cache key prefixes to `goong:*`

| Field | Value |
|-------|-------|
| **Context** | Old cache entries hold Google-shaped payloads; serving them under the new provider would return stale/mismatched shapes. |
| **Decision** | Prefix all route cache keys with `goong:` so old entries are never read. |
| **Rationale** | Clean cutover with no manual cache flush; stale entries expire by TTL. |
| **Impact** | Cold cache on first deploy for `/routes/*`; self-heals within one TTL window. |

---

## Decisions to Promote

### Candidates for Promotion

- [x] D-T-0050-1 (adapter/provider swap) — promoted to global `DECISIONS.md` as **D-0007** (affects T-0053, T-0054, T-0056 and supersedes the Google-backend part of the routing stack). User-confirmed.
- [ ] D-T-0050-2 (transit rejection) — task-scoped, kept here.
- [ ] D-T-0050-3 (cache prefix) — task-scoped, kept here.
