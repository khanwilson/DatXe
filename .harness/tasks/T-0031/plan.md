# Plan

**Task ID**: T-0031  
**Phase**: Planning  
**Created**: 2026-06-24  

---

## Analysis

### Scope Clarification

- **Affected Projects**: nestjs_prisma only
- **Affected Files**: 8 new files (module, controller, service, DTOs, config), 2 modified files (app.module.ts, .env.example)
- **Estimated Complexity**: High (external API integration, caching, error handling)

### Dependencies

- **Previous Tasks**: T-0003 (Redis) — required for caching
- **External Dependencies**: Google Maps API (Directions, Distance Matrix, Geocoding, Places), axios (HTTP client)
- **Blocked By**: None — can start immediately

### Risks

- **Risk 1**: Google Maps API quota/cost exhaustion → Mitigation: Redis caching, billing alerts, rate limiting
- **Risk 2**: API latency (1-3s) → Mitigation: Aggressive caching (15-60 min TTL)
- **Risk 3**: Google API key exposure → Mitigation: Config validation, no logging of API key
- **Risk 4**: Google service unavailability → Mitigation: Clear error messages, circuit breaker pattern

---

## Implementation Approach

### Step 1: Create Google Maps Configuration
- Config file with API key, base URL, timeouts, retry settings, cache TTLs
- Env validation for GOOGLE_MAPS_API_KEY

### Step 2: Create Google Maps Service
- Wrapper around Google Maps APIs (Directions, Distance Matrix, Geocoding, Places)
- Retry logic with exponential backoff
- Error handling for quota/timeout/invalid key

### Step 3: Create Route Cache Service
- Redis caching wrapper with typed keys
- TTL configuration per API endpoint
- Cache invalidation strategy

### Step 4: Create DTOs and Route Responses
- Request/response DTOs for all 5 endpoints
- Validation using class-validator

### Step 5: Create Routes Controller
- 5 endpoints: directions, distance-matrix, geocode, places/autocomplete, places/:placeId
- Input validation, response wrapping

### Step 6: Create Routes Service
- Business logic combining GoogleMapsService + RouteCacheService
- Decision: cache hit → return, cache miss → call Google API, cache result

### Step 7: Integrate into App
- Add RoutesModule to app.module.ts
- Update .env.example with GOOGLE_MAPS_API_KEY

### Step 8: Testing
- Build + lint verification
- Manual API test (using mock Google Maps responses)

---

## Testing Strategy

- **Unit tests**: GoogleMapsService, RouteCacheService (mock HTTP, Redis)
- **Integration tests**: Routes controller with mocked Google API
- **Manual testing**: Call 5 endpoints with real/mock data, verify response format
- **Edge cases**: No cache hit, retry on timeout, quota exceeded, missing address components

---

## Estimated Effort

- Planning: 30 min (done now)
- Implementation: 2.5-3 hours (Google wrapper, caching, endpoints, config)
- Testing: 1 hour (build, lint, manual tests)
- Total: ~4 hours

---

## Acceptance Criteria

- [x] Plan drafted
- [ ] Contract approved
- [ ] All 5 endpoints implemented with correct response format
- [ ] Google Maps API integration complete
- [ ] Redis caching working (with appropriate TTLs)
- [ ] Error handling for Google API failures
- [ ] No lint/type errors
- [ ] Build succeeds
- [ ] Manual test: 2+ endpoints verified
- [ ] No hard-coded secrets
- [ ] Configuration validated at startup
