# Handoff: T-0074

## Summary

Implemented the complete Phone + OTP authentication flow end-to-end across backend and both mobile apps. The backend gained 4 new endpoints (OTP request/verify, refresh, logout) with Redis-backed refresh token rotation, while app_user and app_taixe received auth navigation guards and 401-triggered token refresh interceptors. All 12 acceptance criteria pass, build/typecheck/lint are clean, and both evaluation and review have signed off with PASS.

## What Was Delivered

### Backend (nestjs_prisma)
- **4 new endpoints** added to `AuthController` (additive, no breaking changes to existing `/auth/login`, `/auth/register`, `/auth/profile`):
  - `POST /auth/otp/request` — Request OTP (DEV: logs `000000`, no SMS)
  - `POST /auth/otp/verify` — Verify OTP, find-or-create User, issue token pair
  - `POST /auth/refresh` — Rotate refresh token, issue new token pair
  - `POST /auth/logout` — Invalidate refresh token in Redis
- **6 new DTOs** with class-validator decorators for request validation
- **RedisService injection** in AuthService for refresh token storage
- **Updated JwtPayload type** to include `phone` and `role`

### Frontend (app_user)
- **Auth navigation guard** in `app/index.tsx` splash screen — routes to HomeScreen if token exists, SigninScreen otherwise
- **Token refresh interceptor** in `src/api/axios/interceptors.ts` — on 401, calls `/auth/refresh` via separate Axios instance, updates Zustand, retries original request

### Frontend (app_taixe)
- **Auth navigation guard** in `app/index.tsx` splash screen — identical to app_user
- **Token refresh interceptor** in `src/api/axios/interceptors.ts` — identical logic to app_user

## Key Implementation Details

- **DEV mode OTP**: Code `000000` is universally accepted. Production rejects all codes (no SMS provider integrated yet).
- **JWT payload**: `{ sub: userId, phone, role }` with 1-day expiry. Signed with `JWT_SECRET` from env.
- **Refresh tokens**: UUID v4 generated via `crypto.randomUUID()`. Stored in Redis with key `refresh_token:<uuid>`, value `{ userId, phone }`, TTL 30 days.
- **Token rotation**: Refresh endpoint deletes old token before creating new one (old token becomes invalid immediately).
- **Race condition handling**: `verifyOtp` uses find-then-create with try/catch fallback to handle concurrent OTP requests for the same phone.
- **OTP user creation**: `user_name = phone`, `password_hash = 'otp-only'` (placeholder, never usable for password login). Customer profile created automatically.
- **Interceptor pattern**: Module-level `isRefreshing` flag + `failedQueue` array prevents concurrent refresh calls. Separate Axios instance for the refresh call prevents infinite interceptor loop.
- **Phone validation**: E.164 VN format regex `/^\+84\d{9}$/` enforced on backend.

## Files Modified

### nestjs_prisma (4 modified, 6 created)
- `api/auth/auth.service.ts` (modified + fix)
- `api/auth/auth.controller.ts` (modified)
- `api/auth/auth.module.ts` (modified)
- `api/auth/types/jwt-payload.type.ts` (modified)
- `api/auth/dto/request-otp.dto.ts` (created)
- `api/auth/dto/verify-otp.dto.ts` (created)
- `api/auth/dto/refresh-token.dto.ts` (created)
- `api/auth/dto/otp-response.dto.ts` (created)
- `api/auth/dto/otp-verify-response.dto.ts` (created)
- `api/auth/dto/refresh-response.dto.ts` (created)

### app_user (2 modified)
- `app/index.tsx` (modified)
- `src/api/axios/interceptors.ts` (modified + fix)

### app_taixe (2 modified)
- `app/index.tsx` (modified)
- `src/api/axios/interceptors.ts` (modified + fix)

**Total: 14 files (10 nestjs_prisma + 2 app_user + 2 app_taixe)**

## API Endpoints

### POST /api/v1/auth/otp/request
- **Request**: `{ "phone": "+84912345678" }`
- **Response 200**: `{ "success": true, "expiresIn": 300 }`
- **Errors**: 400 (invalid phone format)

### POST /api/v1/auth/otp/verify
- **Request**: `{ "phone": "+84912345678", "code": "000000" }`
- **Response 200**: `{ "accessToken": "eyJ...", "refreshToken": "uuid", "user": { "id", "phone", "name", "email", "role" } }`
- **Errors**: 401 (invalid OTP code)

### POST /api/v1/auth/refresh
- **Request**: `{ "refreshToken": "uuid" }`
- **Response 200**: `{ "accessToken": "eyJ...", "refreshToken": "new-uuid" }`
- **Errors**: 401 (invalid/expired refresh token)

### POST /api/v1/auth/logout
- **Request**: `{ "refreshToken": "uuid" }`
- **Response 200**: `{ "success": true }`

## Testing

| Check | Result | Notes |
|-------|--------|-------|
| `bun run build` (nestjs_prisma) | PASS | Clean build, no errors |
| `npx tsc --noEmit` (app_user) | PASS | No type errors |
| `npx tsc --noEmit` (app_taixe) | PASS | No type errors |
| `bun lint` (app_user) | PASS | 0 errors, 3 pre-existing warnings |
| `bun lint` (app_taixe) | PASS | 0 errors, 4 pre-existing warnings |
| Acceptance criteria (12) | PASS | All 12 criteria met |

### Evaluation Issues Found and Fixed

1. **FAIL-1 (High)**: Inverted OTP verification condition allowed all codes in production. Fixed by replacing with `isDevBypass` logic that correctly rejects all codes in production and accepts only `000000` in DEV.
2. **FAIL-2 (Low)**: `Array<T>` syntax introduced ESLint warning. Fixed by using `T[]` shorthand.

Both fixes verified in re-evaluation run 2.

## Contract Status

**PASS** — All 14 allowed files modified per contract. No out-of-scope files touched. Protected files verified untouched:
- `prisma/schema.prisma` — no migration
- Legacy DTOs (`auth-response.dto.ts`, `login.dto.ts`, `register.dto.ts`) — unchanged
- `strategies/jwt.strategy.ts` — unchanged

## Review Status

**PASS** — All 12 acceptance criteria verified. No regression risk. All issues from evaluation resolved. Code quality, security, performance, and edge cases all pass review.

## Known Issues

1. **Production OTP verification not implemented** — No SMS provider integrated. Production environment will reject all OTP codes. This is expected per task scope (DEV-only feature).
2. **Phone field has no unique constraint** — Race condition possible if two simultaneous OTP verifies occur for same phone. Mitigated by try/catch fallback in `verifyOtp`, but a proper fix requires Prisma migration with `@unique` on `phone` (separate task).
3. **No rate limiting on OTP endpoints** — Vulnerable to abuse. Out of scope for this task.
4. **No access token blacklist** — Logout only invalidates refresh token. Access tokens remain valid until expiry (1 day). Out of scope.

## Follow-up / Next Steps

1. **Integrate SMS provider for production OTP** — Required before production launch. Candidates: Twilio, Vonage, eSMS (Vietnam). Store generated codes in Redis with 5-min TTL.
2. **Add unique constraint to phone field** — Requires Prisma migration. Add `@unique` to `phone` field in `User` model. Create migration: `prisma migrate dev --name add-phone-unique`.
3. **Consider rate limiting on OTP endpoints** — Use NestJS `@nestjs/throttler` or similar. Prevent abuse of OTP request endpoint.
4. **Consider access token blacklist for logout** — Optional security enhancement. Use Redis with short TTL.
5. **Remove `password_hash` placeholder for OTP users** — Future cleanup. Could use `null` if Prisma schema allows (currently `String`, not `String?`).
6. **T-0069 (app_taixe Foundation) and T-0070 (app_taixe Trip Flow) unblocked** — These tasks depend on T-0074's auth flow completion and can now proceed.

## Final Status

Done
