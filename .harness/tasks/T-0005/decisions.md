# Decisions (Task-Scoped)

**Task ID**: T-0005  
**Date**: 2026-06-24  

---

## Task-Scoped Decisions

These decisions only affect this task and are not promoted to global `DECISIONS.md`.

### D-T-0005-1: Response Format Wrapping via Interceptor

| Field | Value |
|-------|-------|
| **Context** | Need unified response format for all endpoints without modifying each controller |
| **Options Considered** | <ul><li>NestJS Interceptor (global)</li><li>Custom decorator per endpoint</li><li>DTO transformation layer</li><li>Response object wrapper class</li></ul> |
| **Decision** | Use NestJS ResponseInterceptor applied globally |
| **Rationale** | Interceptors apply universally without code changes to existing/future controllers; clean separation of concerns; standard NestJS pattern |
| **Impact** | All endpoint responses now wrapped in `{ success: true, data, meta: { requestId } }` format |

### D-T-0005-2: Middleware Execution Order

| Field | Value |
|-------|-------|
| **Context** | Multiple middleware (RequestId, Logger) need to execute in correct order for requestId to be available to logger |
| **Options Considered** | <ul><li>RequestId → Logger</li><li>Logger → RequestId</li><li>Single combined middleware</li></ul> |
| **Decision** | RequestId first, then Logger |
| **Rationale** | RequestId must be set on request before Logger accesses it; separation of concerns keeps each middleware focused |
| **Impact** | Middleware order in main.ts: `app.use(RequestIdMiddleware)` before `app.use(LoggerMiddleware)` |

### D-T-0005-3: HTTP Status Code to Error Code Mapping

| Field | Value |
|-------|-------|
| **Context** | Error responses need semantic error codes (BAD_REQUEST, UNAUTHORIZED, etc.) not just numeric status codes |
| **Options Considered** | <ul><li>Hardcoded mapping in filter (implemented)</li><li>Enum-based mapping</li><li>Use status code directly</li><li>Custom error codes for all scenarios</li></ul> |
| **Decision** | Hardcoded mapping of HTTP status codes to error code strings |
| **Rationale** | Simple, maintainable, covers all standard HTTP statuses; extensible for custom codes later |
| **Impact** | HttpExceptionFilter has getErrorCode() method mapping 400→BAD_REQUEST, 401→UNAUTHORIZED, etc. |

---

## Decisions to Promote

No decisions affect future tasks or global architecture. All are infrastructure implementation details specific to T-0005.

### Candidates for Promotion

- [ ] None — all decisions are task-scoped and don't impact future work patterns

