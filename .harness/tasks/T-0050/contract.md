# Contract

**Task ID**: T-0050
**Phase**: Contracting
**Created**: 2026-07-01

---

## Scope

### In Scope

- Create `GoongConfig` (`api/config/goong.config.ts`) mirroring `GoogleMapsConfig` (apiKey, baseUrl `https://rsapi.goong.io`, timeout, retryAttempts, cache TTLs, URL getters for Goong endpoints).
- Create `GoongService` (`api/modules/routes/services/goong.service.ts`) with the **same public method signatures** as `GoogleMapsService` (drop-in): `getDirections`, `getDistanceMatrix`, `getGeocoding`, `getPlacesAutocomplete`, `getPlacesDetails`.
- `GoongService` acts as an **adapter**: calls Goong endpoints, then normalizes each response into the **Google-compatible shape** that `RoutesService.transform*()` already consumes.
- Port retry + exponential-backoff logic from `GoogleMapsService`.
- Rewire `RoutesModule` providers: `GoongService`/`GoongConfig` replace `GoogleMapsService`/`GoogleMapsConfig`.
- `RoutesService`: swap injected dependency to `GoongService` (constructor + 5 call sites). Transform methods untouched.
- `RouteCacheService`: inject `GoongConfig` instead of `GoogleMapsConfig`; bump cache-key prefixes to `goong:*`.
- `.env.example` + `.env`: add `GOONG_API_KEY`, `GOONG_BASE_URL`.
- `env.validation.ts`: add optional `GOONG_API_KEY`, `GOONG_BASE_URL`.

### Out of Scope

- Frontend changes (any app_user / app_taixe files).
- Removing Google Maps files / env vars (deferred to T-0056).
- Changing `RoutesController` endpoints, routes, or any DTO in `dto/routes.dto.ts`.
- Database / Prisma changes.
- Adding a test framework (none exists in routes module; log as skipped).

---

## Allowed Files

```
nestjs_prisma/api/config/goong.config.ts                          (new)
nestjs_prisma/api/modules/routes/services/goong.service.ts        (new)
nestjs_prisma/api/modules/routes/routes.service.ts                (edit — DI swap only)
nestjs_prisma/api/modules/routes/services/route-cache.service.ts  (edit — config type + key prefix)
nestjs_prisma/api/modules/routes/routes.module.ts                 (edit — providers swap)
nestjs_prisma/api/common/config/env.validation.ts                 (edit — add Goong vars)
nestjs_prisma/.env.example                                        (edit — add Goong vars)
nestjs_prisma/.env                                                (edit — add Goong vars)
.harness/tasks/T-0050/**                                          (task docs)
.harness/TASKS.md, .harness/PROJECT_STATE.md, .harness/DECISIONS.md (index/state on close)
```

**Rationale**: Backend-only provider swap. `RoutesController` and DTOs deliberately excluded to guarantee the API contract stays unchanged.

---

## Impacted Projects

- [ ] app_taixe
- [ ] app_user
- [x] nestjs_prisma
- [ ] docs
- [x] harness (task docs + state)

---

## Acceptance Criteria

- [ ] `GoongService` implements all 5 methods (directions, distance-matrix, geocoding, autocomplete, details).
- [ ] `RoutesService` uses `GoongService` (not `GoogleMapsService`); transform methods unchanged.
- [ ] Existing `/routes/*` endpoints return the same response shape (`{ success, data }` envelope + same `data` fields).
- [ ] Goong config validated on boot — missing `GOONG_API_KEY` → clear error.
- [ ] Redis caching still works (key prefixes bumped to `goong:*`).
- [ ] Retry logic with exponential backoff on transient (5xx/timeout) errors preserved.
- [ ] `transit` mode is rejected with a clear error (Goong supports car/bike only).
- [ ] TypeScript compiles: `bun run build`.
- [ ] No lint errors: `bun run lint`.
- [ ] No hard-coded secrets/API keys (key comes from env only).
- [ ] All changes within Allowed Files.

---

## API Contract Changes

### New Endpoints

None.

### Modified Endpoints

None. All `/routes/*` endpoints keep identical request DTOs, response shape, and status codes. Only the internal data provider changes (Google Maps → Goong).

```
POST /routes/directions        — unchanged shape
POST /routes/distance-matrix   — unchanged shape
POST /routes/geocode           — unchanged shape
GET  /routes/places/autocomplete — unchanged shape
GET  /routes/places/:placeId   — unchanged shape
```

**Behavioral note (non-breaking on shape):** `mode: "transit"` (allowed by DTO enum) now returns a `400 Bad Request` from the service layer, because Goong has no transit vehicle. `driving→car`, `walking→bike`.

### Deprecated Endpoints

None.

---

## Database Impact

### Prisma Schema Changes

None.

### Migrations Required

- [ ] None.

---

## Provider Response Mapping (Goong → Google-compatible)

| Method | Goong endpoint | Normalized to (what RoutesService reads) |
|--------|----------------|------------------------------------------|
| getDirections | `/Direction` | `{ routes: [{ legs: [{ distance, duration, steps }] }] }` |
| getDistanceMatrix | `/DistanceMatrix` | `{ rows: [...] }` |
| getGeocoding | `/Geocode` | `{ results: [{ formatted_address, place_id, address_components: [{ types, long_name }] }] }` |
| getPlacesAutocomplete | `/Place/AutoComplete` | `{ predictions: [{ place_id, description, main_text, secondary_text }] }` (flatten `structured_formatting`) |
| getPlacesDetails | `/Place/Detail` | `{ result: { place_id, name, formatted_address, geometry: { location: { lat, lng } }, ... } }` |

Mode → vehicle: `driving→car`, `walking→bike`, `transit→reject (400)`.

---

## Test Strategy

- **Unit Tests**: none exist in routes module; not adding a framework (logged as skipped per CLAUDE.md §10).
- **Type check**: `bun run build` must compile clean.
- **Lint**: `bun run lint` must pass.
- **API Contract**: verify each normalizer output matches the exact field paths `RoutesService.transform*()` reads.
- **Edge Cases**: missing `GOONG_API_KEY` → clear boot error; empty predictions/results → empty arrays (no crash); `transit` → 400; retry on simulated 5xx.

---

## Sign-off

- **Planner**: FRIDAYAIX
- **Code Owner**: nathan
- **Approved**: [ ] Yes / [ ] No
- **Approved At**: [Date]
