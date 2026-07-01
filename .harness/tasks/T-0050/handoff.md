# Handoff

**Task ID**: T-0050
**Title**: Backend — Goong API Service (Replace GoogleMapsService)
**Completed**: 2026-07-01
**Duration**: ~2.5 h

---

## Summary

Replaced the Google Maps provider behind the `/routes/*` API with Goong (`https://rsapi.goong.io`). Introduced `GoongService` as an **adapter** that normalizes Goong responses back into the Google-compatible shape the existing `RoutesService` already consumes — so the public API contract, controller, and all DTOs are unchanged. Google Maps files remain in place; their removal is T-0056.

---

## What Was Delivered

- `GoongConfig` — env-driven config (`GOONG_API_KEY`, `GOONG_BASE_URL`), same timeout/retry/cache-TTL block as the Google config, hard boot error on missing key.
- `GoongService` — 5 methods (directions, distance-matrix, geocoding, autocomplete, place details) + Goong→Google normalizers + ported exponential-backoff retry.
- Rewired `RoutesModule`, `RoutesService`, `RouteCacheService` to Goong.
- Env + validation updated; cache key prefixes bumped to `goong:*`.

---

## API Changes

No endpoint or DTO changes. `/routes/*` request and `{ success, data }` response shapes are identical.

**One behavioral change:** `mode: "transit"` → **400 Bad Request** (Goong supports only car/bike). `driving→car`, `walking→bike`.

---

## Database Changes

None.

---

## Lessons Learned

### What Went Well
- Adapter pattern kept the blast radius tiny — `RoutesService` transforms and every DTO untouched.
- Build + lint clean on first full pass after fixes.

### What Was Challenging
- **Cache prefix consistency**: bumping `get*` prefixes but not the matching `set*` prefixes silently breaks the cache (reads/writes hit different keys). Fixed by re-reading the whole file and pairing every get/set. Lesson: when renaming cache keys, grep the pair, don't eyeball.
- **Goong address shape**: Goong returns a `compound` object (`province`/`district`/`commune`) rather than Google's typed `address_components`. Adapter synthesizes the `{ types, long_name }` entries so `extractAddressComponents` keeps working.

### What We'd Do Differently
- Add a real smoke test against a live Goong key before closing — mapping is currently verified by static trace only.

---

## Next Steps

### Immediate Next Tasks
1. **T-0053** (Goong Places Autocomplete, app_user) — now unblocked on the backend side.
2. **T-0054** (Route display, app_user) — depends on this + T-0052.
3. **T-0056** (remove Google Maps deps/env) — safe once frontend map tasks land.

### Known Technical Debt
- Live Goong response mapping unverified (no key in `.env`) — **Medium**. Smoke-test each of the 5 endpoints once a key is available; watch `compound`→`address_components` and autocomplete `structured_formatting` flattening.
- No unit tests in routes module — **Low** (pre-existing).

---

## Testing Coverage

- Build: ✅ `nest build`
- Lint: ✅ `eslint`
- Unit/integration: none (no framework wired — §10 skip)
- Live API: ❌ not run (placeholder key)

---

## Security Review

- [x] No hard-coded secrets — key read from env; `.env.example` holds a placeholder only
- [x] Input validation — unchanged DTOs (`class-validator`)
- [x] No SQL (no DB access in this module)
- [x] `GOONG_API_KEY` never logged

---

## Deployment Notes

### Prerequisites
- Set `GOONG_API_KEY` in the deploy environment (and `GOONG_BASE_URL` if overriding the default).

### Deployment Steps
1. Set env vars.
2. Deploy — `GoongConfig` throws on boot if the key is missing (fail-fast).
3. First `/routes/*` calls run cold (new `goong:*` cache prefix); cache warms within one TTL.

### Rollback Plan
- Revert `RoutesModule`/`RoutesService`/`RouteCacheService` to inject `GoogleMapsService`/`GoogleMapsConfig` (files still present) and restore `GOOGLE_MAPS_API_KEY`. No data migration involved.

---

## File Changes Summary

- **Projects Modified**: nestjs_prisma
- **Total Files Changed**: 8 (2 added, 6 modified)

See `files-changed.md` for details.
