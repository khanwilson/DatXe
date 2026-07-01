# T-0050: Backend — Goong API Service (Replace GoogleMapsService)

**Status**: Planned  
**Priority**: P1  
**Projects**: nestjs_prisma  
**Depends On**: —

---

## Description

Replace `GoogleMapsService` with a new `GoongService` that calls Goong API endpoints for:
- Directions (driving, walking, bicycling)
- Distance Matrix
- Geocoding (reverse: latlng → address)
- Places Autocomplete
- Place Details

The `RoutesService` and `RoutesController` API contracts remain **unchanged** — only the internal provider swaps.

---

## Scope

### In Scope
- Create `api/config/goong.config.ts` (replaces `google-maps.config.ts`)
- Create `api/modules/routes/services/goong.service.ts` (replaces `google-maps.service.ts`)
- Update `RoutesService` to inject `GoongService` instead of `GoogleMapsService`
- Update `RoutesModule` providers
- Update `.env.example` with `GOONG_API_KEY` and `GOONG_BASE_URL`
- Update `config/env.validation.ts` to validate new env vars
- Keep retry logic and error handling similar to current implementation
- Transform Goong API responses to match existing DTOs (backward-compatible)

### Out of Scope
- Frontend changes
- Removing Google Maps files (handled in T-0056)
- Changing `RoutesController` endpoints or DTOs
- Database/Prisma changes

---

## Acceptance Criteria

- [ ] `GoongService` implements all 5 API methods (directions, distance-matrix, geocoding, autocomplete, details)
- [ ] `RoutesService` uses `GoongService` (not `GoogleMapsService`)
- [ ] Existing REST endpoints (`/routes/*`) return same response shape
- [ ] Goong config validated on boot (missing key → clear error)
- [ ] Redis caching still works (cache keys may update prefix)
- [ ] Retry logic with exponential backoff on transient errors
- [ ] TypeScript compiles without errors
- [ ] Lint passes

---

## Goong API Reference

Base URL: `https://rsapi.goong.io`

| Endpoint | Method | Key Params |
|----------|--------|------------|
| `/Direction` | GET | `origin`, `destination`, `vehicle` (car/bike/taxi), `api_key` |
| `/DistanceMatrix` | GET | `origins`, `destinations`, `vehicle`, `api_key` |
| `/Geocode` | GET | `latlng` OR `address`, `api_key` |
| `/Place/AutoComplete` | GET | `input`, `location` (optional bias), `api_key` |
| `/Place/Detail` | GET | `place_id`, `api_key` |

### Response Differences from Google
- Goong `vehicle` param: `car`, `bike`, `taxi` (vs Google's `driving`, `walking`, `transit`)
- Goong directions returns `routes[].legs[].steps[]` (similar structure)
- Goong autocomplete returns `predictions[]` with `place_id`, `description`, `structured_formatting`
- Goong geocode returns `results[]` with `formatted_address`, `geometry.location`, `address_components`
