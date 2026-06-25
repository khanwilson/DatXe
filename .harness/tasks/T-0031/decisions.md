# Decisions (Task-Scoped)

**Task ID**: T-0031  
**Date**: 2026-06-24  

---

## Task-Scoped Decisions

These decisions only affect this task and are not promoted to global `DECISIONS.md`.

### D-T-0031-1: Google Maps API Wrapper vs Direct Integration

| Field | Value |
|-------|-------|
| **Context** | Need to integrate with Google Maps APIs for routing, distance, geocoding, places |
| **Options Considered** | <ul><li>Wrapper service (GoogleMapsService) with unified error handling</li><li>Direct axios calls in controller</li><li>Use @googlemaps/google-maps-services-js library</li></ul> |
| **Decision** | Create GoogleMapsService wrapper with unified error handling and retry logic |
| **Rationale** | Centralized error handling, retry logic, logging, easier testing/mocking, single point of dependency |
| **Impact** | google-maps.service.ts handles all API calls, controller delegates to RoutesService which delegates to GoogleMapsService |

### D-T-0031-2: Cache-Then-API Pattern

| Field | Value |
|-------|-------|
| **Context** | Google Maps API calls are slow (1-3s) and costly; need to minimize calls |
| **Options Considered** | <ul><li>Always call API, cache result after</li><li>Check cache first, then API if miss</li><li>Always use cache, background refresh</li></ul> |
| **Decision** | Check cache first (hit = return), miss = call API → cache → return |
| **Rationale** | Reduces API calls immediately for repeat requests; simple to understand; good cache hit rate for same routes |
| **Impact** | RoutesService implements cache-check first, then API call pattern |

### D-T-0031-3: Per-Endpoint Cache TTLs

| Field | Value |
|-------|-------|
| **Context** | Different endpoints have different cache invalidation patterns |
| **Options Considered** | <ul><li>Same TTL for all (15 min)</li><li>Per-endpoint TTLs (15 min, 1 hour, 5 min)</li><li>No caching</li></ul> |
| **Decision** | Different TTLs per endpoint: directions/distance 15 min, geocoding/place details 1 hour, autocomplete 5 min |
| **Rationale** | Routes change frequently (traffic); addresses stable (1 hour); autocomplete is search-heavy (short TTL reduces stale results) |
| **Impact** | GoogleMapsConfig.cache TTL values differ; RouteCacheService uses correct TTL per endpoint |

### D-T-0031-4: Exponential Backoff Retry Strategy

| Field | Value |
|-------|-------|
| **Context** | Google Maps API sometimes times out; need retry strategy without hammering API |
| **Options Considered** | <ul><li>Fixed delay retry (wait 1s, then retry)</li><li>Exponential backoff (wait 2^attempt * 1000ms)</li><li>No retry</li></ul> |
| **Decision** | Exponential backoff: 2^attempt seconds, max 2 attempts (2 retries = 1 initial + 2 retries) |
| **Rationale** | Exponential backoff reduces load on API during outages; 2 attempts balances reliability vs latency |
| **Impact** | GoogleMapsService.callGoogleApi implements exponential backoff in loop |

---

## Decisions to Promote

No decisions affect future tasks or global architecture. All are implementation details specific to T-0031.

### Candidates for Promotion

- [ ] None — all decisions are task-scoped
