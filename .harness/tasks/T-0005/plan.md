# Plan

**Task ID**: T-0005  
**Phase**: Planning  
**Created**: 2026-06-22  
**Updated**: 2026-06-24

---

## Analysis

### Scope Clarification

- **Affected Projects**: nestjs_prisma only
- **Affected Files**: main.ts, 4 new common modules (interceptors, filters, middleware, logger)
- **Estimated Complexity**: Medium (infrastructure layer, affects all API responses)

### Dependencies

- **Previous Tasks**: T-0001 (backend env), T-0003 (Redis for distributed request ID if needed)
- **External Dependencies**: class-validator, class-transformer (likely already in NestJS), uuid library
- **Blocked By**: None — can start immediately

### Risks

- **Risk 1**: Response format change affects all existing/future endpoints → Mitigation: Implement early, before more APIs added (T-0006 onwards depend on this)
- **Risk 2**: Validation pipe may reject valid requests if not tuned correctly → Mitigation: Use ConfigurableClassValidatorPipe with careful error messages
- **Risk 3**: Request ID generation under high concurrency → Mitigation: Use uuid (v4) which is collision-resistant
- **Risk 4**: Logging overhead from JSON structured logs → Mitigation: Defer to production only via env flag

---

## Implementation Approach

### Step 1: Create Response Interceptor
- Intercept successful HTTP responses (200-299)
- Wrap data in `{ success: true, data: payload, meta: { requestId } }` format
- Extract requestId from request context (set by middleware)
- Apply to all endpoints uniformly

### Step 2: Create HTTP Exception Filter
- Catch all exceptions (built-in and custom)
- Transform to `{ success: false, error: { code: string, message: string }, meta: { requestId } }`
- Never expose stack traces (production safety)
- Map HTTP status codes to error codes (e.g., 400 → "BAD_REQUEST")
- Return appropriate HTTP status codes for frontend

### Step 3: Create Request ID Middleware
- Generate UUID for each incoming request
- Attach to `request.id` and store in request context
- Propagate to response headers (e.g., `X-Request-ID`)
- Ensure available to response interceptor, exception filter, and logs

### Step 4: Create Logger Middleware (or enhance existing)
- Log JSON-structured entries with requestId, method, url, status, duration
- Include timestamp, level, service name
- Skip health check endpoints if needed
- Log on request completion (via response.on('finish'))

### Step 5: Update main.ts
- Apply middleware globally in NestFactory bootstrap
- Register exception filter globally
- Register response interceptor globally
- Apply class-validator validation pipe globally

---

## Testing Strategy

- **Unit tests**: Interceptor/filter isolation (mock request/response context)
- **Integration tests**: Full HTTP request cycle (if Jest/Supertest available)
- **Manual testing**: Test at least 3 endpoints (success 200, error 400, error 500)
- **Edge cases**: 
  - Nested errors (validation errors with multiple field messages)
  - Unhandled exceptions (should still return proper format)
  - Concurrent requests (request IDs should be unique)
  - Duplicate requests (each gets new requestId)

---

## Estimated Effort

- Planning: 30 min (done now)
- Implementation: 1-1.5 hours (5 files, ~150-200 LOC total)
- Testing: 30 min (build + lint + manual API test)
- Total: ~2.5 hours

---

## Acceptance Criteria

- [x] Plan drafted
- [ ] Contract approved by user
- [ ] All 4 new modules created with proper structure
- [ ] main.ts updated to apply middleware/filters/interceptor/pipe
- [ ] No lint/type errors: `bun run lint` + `bun run typecheck`
- [ ] Build succeeds: `bun run build`
- [ ] Test at least 2 endpoints manually (success + error case)
- [ ] No hard-coded secrets
- [ ] Response format matches spec exactly
- [ ] Request ID propagates through entire stack

