# Contract

**Task ID**: T-0031  
**Phase**: Contracting  
**Created**: 2026-06-24  

---

## Scope

### In Scope

- Google Maps API integration (Directions, Distance Matrix, Geocoding, Places)
- 5 REST API endpoints for routing
- Redis caching for all Google API calls
- Error handling for Google API failures
- Configuration management with env validation
- Input validation using class-validator

### Out of Scope

- Mobile app implementation (handled by T-0018, T-0022)
- Google Maps frontend integration
- Rate limiting (basic error responses only)
- Real-time traffic updates
- Alternative routing providers
- Polyline decoding (frontend responsibility)

---

## Allowed Files

```
nestjs_prisma/src/modules/routes/**
nestjs_prisma/src/config/google-maps.config.ts
nestjs_prisma/src/app.module.ts
nestjs_prisma/.env.example
nestjs_prisma/package.json
.harness/tasks/T-0031/**
```

**Rationale**: T-0031 is backend-only service in nestjs_prisma.

---

## Impacted Projects

- [x] nestjs_prisma
- [ ] app_taixe
- [ ] app_user

---

## Acceptance Criteria

- [x] All 5 endpoints implemented with correct request/response format
- [x] Google Maps API integration complete (Directions, Distance Matrix, Geocoding, Places)
- [x] Redis caching working with correct TTLs
- [x] Error handling for quota, timeout, invalid API key
- [x] Configuration file with env validation
- [x] No lint errors: `bun run lint`
- [x] No type errors: `bun run typecheck`
- [x] Build succeeds: `bun run build`
- [x] Manual test: 2+ endpoints return correct format
- [x] No hard-coded API key
- [x] All changes within Allowed Files
- [x] Follows project conventions

---

## API Contract Changes

### New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/routes/directions` | POST | Calculate route between origin/destination |
| `/api/v1/routes/distance-matrix` | POST | Calculate distances between multiple origins/destinations |
| `/api/v1/routes/geocode` | POST | Convert coordinates to address |
| `/api/v1/routes/places/autocomplete` | GET | Autocomplete address search |
| `/api/v1/routes/places/:placeId` | GET | Get place details |

### Response Format

All responses follow standard format:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "meta": { "requestId": "uuid" }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "meta": { "requestId": "uuid" }
}
```

---

## Database Changes

None. No schema changes, no migrations.

---

## Test Strategy

- **Unit Tests**: GoogleMapsService, RouteCacheService (mocked HTTP/Redis)
- **Integration Tests**: Routes controller with mock Google API responses
- **Manual Testing**: Call 5 endpoints, verify response format matches contract
- **Edge Cases**: Cache miss, retry on timeout, quota exceeded, missing fields

---

## Configuration

### Environment Variables

```
GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_MAPS_BASE_URL=https://maps.googleapis.com/maps/api
```

### Cache TTLs

- Directions: 15 minutes
- Distance Matrix: 15 minutes
- Geocoding: 1 hour
- Places Autocomplete: 5 minutes
- Places Details: 1 hour

---

## Sign-off

- **Planner**: FRIDAYAIX
- **Approved**: Pending user review
- **Approved At**: -
