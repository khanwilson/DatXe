# Implementation

**Task ID**: T-0050
**Phase**: Generating
**Created**: 2026-07-01
**Completed**: 2026-07-01

---

## Summary

Replaced the Google Maps backend routing provider with Goong. Introduced `GoongService` as an **adapter** that calls Goong API endpoints and normalizes each response back into the Google-compatible shape that `RoutesService.transform*()` already consumes. This keeps `RoutesController`, all DTOs, and `RoutesService` transform logic unchanged — the `/routes/*` API contract is byte-for-byte identical.

---

## Changes Made

### Backend (nestjs_prisma)

- Added files:
  - `api/config/goong.config.ts` — Goong config (apiKey from `GOONG_API_KEY`, baseUrl `https://rsapi.goong.io`, timeout, retryAttempts, cache TTL block, URL getters for `/Direction`, `/DistanceMatrix`, `/Geocode`, `/Place/AutoComplete`, `/Place/Detail`). Throws on missing key.
  - `api/modules/routes/services/goong.service.ts` — adapter with 5 public methods matching `GoogleMapsService` signatures + response normalizers + retry logic.
- Modified files:
  - `api/modules/routes/routes.service.ts` — inject `GoongService` instead of `GoogleMapsService` (constructor + 6 call sites). Transform methods untouched.
  - `api/modules/routes/services/route-cache.service.ts` — inject `GoongConfig` instead of `GoogleMapsConfig`; bumped all cache-key prefixes to `goong:*`.
  - `api/modules/routes/routes.module.ts` — swapped providers/imports (`GoongService`/`GoongConfig`).
  - `api/common/config/env.validation.ts` — added optional `GOONG_API_KEY`/`GOONG_BASE_URL`.
  - `.env.example` + `.env` — added Goong vars (Google vars kept; removal deferred to T-0056).

Implementation details:
- **Vehicle mapping** (`mapVehicle`): `driving→car`, `walking→bike`, `transit→throws Error` (per user decision), unknown mode→throws. Error propagates to `RoutesController` try/catch → `BadRequestException` (400).
- **Normalizers** reshape Goong responses into Google-shaped fields:
  - directions → `{ routes: [...] }`
  - distanceMatrix → `{ rows: [...] }`
  - geocoding → `{ results: [{ formatted_address, place_id, geometry, address_components:[{types,long_name}] }] }` (built from Goong `compound.commune/district/province`)
  - autocomplete → `{ predictions: [{ place_id, description, main_text, secondary_text }] }` (flattens `structured_formatting`)
  - placeDetails → `{ result: { place_id, name, formatted_address, geometry, formatted_phone_number, rating, photos } }`
- **Retry**: exponential backoff on 5xx/timeout ported from Google service unchanged.

### Frontend

Not touched (out of scope).

### Database (Prisma)

No changes (out of scope).

---

## Code Quality Checks

- [x] ESLint: PASS (`bun run lint` clean)
- [x] TypeScript: PASS (`nest build` clean)
- [ ] Tests: N/A — no test framework wired for routes module (logged skipped per CLAUDE.md §10)
- [x] Build: PASS (both new files emitted to `dist/`)
- [x] No console.log left
- [x] No TODO comments left
- [x] No hard-coded secrets (API key from env only)

---

## API Verification

### Endpoints (unchanged contract)

- `POST /routes/directions` ✅ — same request/response shape
- `POST /routes/distance-matrix` ✅
- `POST /routes/geocode` ✅
- `GET /routes/places/autocomplete` ✅
- `GET /routes/places/:placeId` ✅

Response envelope `{ success, data }` structurally identical. Verified by static trace against the field paths `RoutesService.transform*()` reads.

---

## Database Verification

No schema changes.

---

## Notes

- **Not live-verified**: `.env` holds a placeholder Goong key, so real Goong round-trips (especially `compound` → `address_components` mapping) were verified by static field-path trace, not an actual API call. Recommend a smoke test once a real `GOONG_API_KEY` is available.
- **Cache prefix bump** to `goong:*` intentionally orphans stale Google-shaped cache entries so they're never served with the new provider. Two get/set prefix mismatches were caught and fixed during generation.
