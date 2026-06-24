# Contract

**Task ID**: T-0005  
**Phase**: Contracting  
**Created**: 2026-06-22  
**Updated**: 2026-06-24

---

## Scope

### In Scope

- Global response interceptor to standardize all HTTP responses
- Global HTTP exception filter to catch and format errors
- Request ID middleware to assign UUID to each request
- Structured JSON logging middleware
- Global validation pipe (class-validator)
- Integration with main.ts bootstrap

### Out of Scope

- Per-endpoint custom response formats (all use global format)
- Custom error codes beyond HTTP standards
- Logging to external services (Sentry, DataDog, etc.)
- Database query logging or tracing
- Performance monitoring/APM
- Changes to existing API endpoints' business logic
- Changes to mobile apps or other projects

---

## Allowed Files

```
nestjs_prisma/api/common/interceptors/**
nestjs_prisma/api/common/filters/**
nestjs_prisma/api/common/middleware/**
nestjs_prisma/api/common/logger/**
nestjs_prisma/api/main.ts
.harness/tasks/T-0005/**
```

**Rationale**: T-0005 is backend-only infrastructure layer in nestjs_prisma.

---

## Impacted Projects

- [x] nestjs_prisma
- [ ] app_taixe
- [ ] app_user

---

## Acceptance Criteria

- [x] All 4 new modules created with TypeScript, proper exports
- [x] Response interceptor transforms successful responses
- [x] Exception filter catches and formats all errors
- [x] Request ID generated and propagated globally
- [x] Structured JSON logging works
- [x] main.ts applies all middleware/filters/interceptor/pipe in correct order
- [x] No lint errors: `bun run lint`
- [x] No type errors: `bun run typecheck`
- [x] Build succeeds: `bun run build`
- [x] Manual test: at least 2 endpoints (success 200 + error 400)
- [x] Response format matches spec exactly
- [x] No hard-coded secrets
- [x] Follows project conventions (naming, structure, TypeScript)
- [x] All changes within Allowed Files section

---

## API Contract Changes

### Response Format — All Endpoints

**Success Response** (status 200-299):
```json
{
  "success": true,
  "data": { /* endpoint payload */ },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Response** (status 400, 401, 403, 404, 500, etc.):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Validation Error Response** (status 400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "must be an email" }
    ]
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## Database Impact

None. No schema changes, no migrations.

---

## Test Strategy

- **Unit Tests**: Interceptor/filter class methods (mocked context)
- **Integration Tests**: Full HTTP cycle if Jest available
- **Manual Testing**: 
  - GET endpoint (success) → verify response format
  - POST with invalid data (400) → verify error format
  - Verify request ID in response headers and body
- **Edge Cases**:
  - Nested validation errors
  - Unhandled exceptions → still return proper format
  - Concurrent requests → unique request IDs

---

## Sign-off

- **Planner**: FRIDAYAIX
- **Approved**: Pending user review
- **Approved At**: -

