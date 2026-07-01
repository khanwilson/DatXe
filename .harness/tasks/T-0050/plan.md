# Plan

**Task ID**: T-0050
**Phase**: Planning
**Created**: 2026-07-01

---

## Analysis

### Scope Clarification

- Affected Projects: `nestjs_prisma` only
- Affected Files (new): `api/config/goong.config.ts`, `api/modules/routes/services/goong.service.ts`
- Affected Files (edit): `api/modules/routes/routes.service.ts`, `api/modules/routes/services/route-cache.service.ts`, `api/modules/routes/routes.module.ts`, `api/common/config/env.validation.ts`, `.env.example`, `.env`
- Estimated Complexity: Medium (provider swap + response normalization)

### Key Architectural Insight

`RoutesService.transform*()` and every DTO read **Google-shaped fields**:
- Directions: `apiResponse.routes[0].legs[0].distance/duration`
- Distance matrix: `apiResponse.rows`
- Geocoding: `results[0].formatted_address / place_id / address_components` (with Google `types` like `route`, `administrative_area_level_1/2`, `country`)
- Autocomplete: `predictions[].place_id / description / main_text / secondary_text`
- Place details: `result.place_id / name / formatted_address / geometry.location / formatted_phone_number / rating / photos`

**Decision**: `GoongService` acts as an **adapter** — it calls Goong endpoints and normalizes each response back into the Google-compatible shape that `RoutesService` already consumes. This keeps `RoutesService.transform*()`, `RoutesController`, and all DTOs **unchanged**, satisfying "API contract remains unchanged."

Consequence: `RoutesService` needs only one edit — swap the injected `GoogleMapsService` for `GoongService` (same method signatures). Its transform logic stays as-is.

### Dependencies

- Previous Tasks: T-0031 (Google Maps routing service — the thing being replaced), T-0003 (Redis cache)
- External Dependencies: Goong API (`https://rsapi.goong.io`), `axios` (already installed), `GOONG_API_KEY`
- Blocked By: nothing

### Risks

- **R1: Goong `address_components` types differ from Google.** Goong may not emit `administrative_area_level_1/2` / `route` / `country` type tokens the same way. → Mitigation: normalize Goong's `compound` object (`province`/`district`/`commune`) and/or its `address_components` into the exact `{ types: [...], long_name }` shape `RoutesService.extractAddressComponents()` expects. Verified mapping documented in contract.
- **R2: Autocomplete field location.** Goong returns `structured_formatting.main_text/secondary_text` (nested), but `RoutesService` reads `p.main_text`/`p.secondary_text` (top-level). → Mitigation: adapter flattens `structured_formatting` up to top-level so existing transform still works.
- **R3: Vehicle/mode mapping.** DTO `mode` enum is `driving|walking|transit`; Goong `vehicle` is `car|bike|taxi`. → Decision (user, 2026-07-01): support **car/bike only, reject transit**. Map `driving→car`, `walking→bike`; any other mode (incl. `transit`) → adapter throws a clear error that surfaces as `BadRequestException` via the controller's catch. DTO enum unchanged (out of scope to alter) — validation still lets `transit` through, then the service rejects it explicitly.
- **R4: Goong status semantics.** Goong returns HTTP 200 with `status`/no top-level `status:"OK"` in some endpoints. → Mitigation: adapter's `callGoongApi` treats HTTP 2xx as success, checks for Goong error payload, preserves retry+backoff.
- **R5: Cache key prefix collision.** Old Google-cached entries have different shapes. → Mitigation: bump cache-key prefixes (e.g. `route:`→`goong:route:`) so stale Google entries are never served. Acceptance criteria explicitly allows prefix change.

---

## Implementation Approach

### Step 1: `GoongConfig` (api/config/goong.config.ts)
Mirror `GoogleMapsConfig`: `apiKey` from `GOONG_API_KEY`, `baseUrl` default `https://rsapi.goong.io`, same `timeout`/`retryAttempts`/`cache` TTL block. Throw on missing key. URL getters for `/Direction`, `/DistanceMatrix`, `/Geocode`, `/Place/AutoComplete`, `/Place/Detail`.

### Step 2: `GoongService` (api/modules/routes/services/goong.service.ts)
Same public method signatures as `GoogleMapsService` (drop-in). Each method:
1. Builds Goong params (`api_key`, `vehicle`, `origin`/`destination` as `lat,lng`, etc.). Mode→vehicle: `driving→car`, `walking→bike`; any other value (incl. `transit`) throws → surfaces as `BadRequestException`.
2. Calls `callGoongApi()` (axios GET, timeout, exponential-backoff retry on 5xx/timeout — ported from Google service)
3. Normalizes the Goong response into Google-compatible shape before returning.

Normalizers:
- directions → `{ routes: [{ legs: [{ distance, duration, steps }] }] }`
- distanceMatrix → `{ rows: [...] }`
- geocoding → `{ results: [{ formatted_address, place_id, address_components:[{types,long_name}] }] }`
- autocomplete → `{ predictions: [{ place_id, description, main_text, secondary_text }] }`
- placeDetails → `{ result: { place_id, name, formatted_address, geometry.location, ... } }`

### Step 3: Wire into RoutesModule + RoutesService + RouteCacheService
- `RoutesModule.providers`: replace `GoogleMapsService`/`GoogleMapsConfig` with `GoongService`/`GoongConfig`.
- `RoutesService`: inject `GoongService` (rename field/param); transforms untouched.
- `RouteCacheService`: inject `GoongConfig` instead of `GoogleMapsConfig`; bump key prefixes to `goong:*`.

### Step 4: Env + validation
- `.env.example` + `.env`: add `GOONG_API_KEY` + `GOONG_BASE_URL` (keep Google vars — removal is T-0056).
- `env.validation.ts`: add optional `GOONG_API_KEY`/`GOONG_BASE_URL` (config class throws hard on missing key at boot, matching Google pattern).

---

## Testing Strategy

- Unit tests: none currently in routes module; will not add a framework (log as skipped per CLAUDE.md §10).
- Type check: `bunx tsc --noEmit` (or `bun run build`) — must pass.
- Lint: `bun run lint` — must pass.
- Manual/contract: confirm `RoutesController` endpoints and response envelope `{ success, data }` are structurally identical; verify each normalizer output matches the field paths `RoutesService.transform*()` reads.
- Edge cases: missing `GOONG_API_KEY` → clear boot error; Goong `ZERO_RESULTS`/empty predictions → empty arrays not crash; retry on simulated 5xx.

---

## Estimated Effort

- Planning: 30 min
- Implementation: ~1.5 h
- Testing/verification: ~30 min
- Total: ~2.5 h

---

## Acceptance Criteria

- [ ] `GoongService` implements all 5 methods (directions, distance-matrix, geocoding, autocomplete, details)
- [ ] `RoutesService` uses `GoongService` (not `GoogleMapsService`); transforms unchanged
- [ ] Existing `/routes/*` endpoints return same response shape
- [ ] Goong config validated on boot (missing key → clear error)
- [ ] Redis caching still works (prefix bumped to `goong:*`)
- [ ] Retry logic with exponential backoff on transient errors preserved
- [ ] TypeScript compiles without errors
- [ ] Lint passes
- [ ] Google Maps files left in place (removal deferred to T-0056)
