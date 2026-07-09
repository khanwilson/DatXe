# Contract: T-0074

## Source Inputs
- Plan: `.harness/tasks/T-0074/plan.md`
- Task description: `.harness/tasks/T-0074/description.md`
- Project state: `.harness/PROJECT_STATE.md`

## Scope

Implement the complete Phone + OTP authentication flow end-to-end:

1. **Backend (nestjs_prisma)**: Four new OTP/token endpoints alongside existing username/password endpoints (no breaking changes).
2. **Frontend (app_user)**: Auth navigation guard in splash screen + automatic token refresh on 401 in Axios interceptor.
3. **Frontend (app_taixe)**: Same auth guard + refresh interceptor as app_user.

## Out of Scope

- Prisma schema migration (no `@unique` on `phone` field in this task).
- SMS provider integration (DEV mock only, code `000000`).
- Driver account creation via OTP (this task creates CUSTOMER users only).
- Rate limiting on OTP endpoints.
- Token blacklist for access tokens (only refresh tokens are tracked in Redis).
- SignupScreen cleanup (orphaned stub, separate task).
- Changes to any `app_user` or `app_taixe` files beyond the 2 listed per app.
- Changes to existing `/auth/login`, `/auth/register`, `/auth/profile` endpoints.

## Allowed Files

**nestjs_prisma (create):**
- `api/auth/dto/request-otp.dto.ts`
- `api/auth/dto/verify-otp.dto.ts`
- `api/auth/dto/refresh-token.dto.ts`
- `api/auth/dto/otp-response.dto.ts`
- `api/auth/dto/otp-verify-response.dto.ts`
- `api/auth/dto/refresh-response.dto.ts`

**nestjs_prisma (modify):**
- `api/auth/types/jwt-payload.type.ts`
- `api/auth/auth.service.ts`
- `api/auth/auth.controller.ts`
- `api/auth/auth.module.ts`

**app_user (modify):**
- `app/index.tsx`
- `src/api/axios/interceptors.ts`

**app_taixe (modify):**
- `app/index.tsx`
- `src/api/axios/interceptors.ts`

## Protected Files / Projects

- `nestjs_prisma/prisma/schema.prisma` -- no schema changes
- `nestjs_prisma/api/auth/dto/auth-response.dto.ts` -- legacy DTO, untouched
- `nestjs_prisma/api/auth/dto/login.dto.ts` -- untouched
- `nestjs_prisma/api/auth/dto/register.dto.ts` -- untouched
- `nestjs_prisma/api/auth/strategies/jwt.strategy.ts` -- no change needed (validate returns payload as-is)
- All `app_user` files beyond `app/index.tsx` and `src/api/axios/interceptors.ts`
- All `app_taixe` files beyond `app/index.tsx` and `src/api/axios/interceptors.ts`

## Acceptance Criteria

1. `POST /auth/otp/request` with valid VN phone (`+84xxxxxxxxx`) returns `{ success: true, expiresIn: 300 }`.
2. `POST /auth/otp/verify` with phone + code `000000` (DEV) creates User + Customer if new phone, returns `{ accessToken, refreshToken, user }`.
3. `POST /auth/otp/verify` with same phone returns same user (find-or-create, no duplicate).
4. `POST /auth/otp/verify` with wrong code returns 401.
5. `POST /auth/refresh` with valid refresh token returns new token pair; old refresh token is invalidated (rotation).
6. `POST /auth/refresh` with invalid/expired token returns 401.
7. `POST /auth/logout` removes refresh token from Redis, returns `{ success: true }`.
8. app_user: opening app without token redirects to `SigninStack/SigninScreen`.
9. app_user: opening app with valid token redirects to `/(tabs)/HomeScreen`.
10. app_user: 401 response triggers refresh, retries original request with new token.
11. app_taixe: same as items 8-10.
12. Existing `/auth/login` and `/auth/register` endpoints still work (no regression).

## Required Checks

- [ ] `bun run build` in `nestjs_prisma`
- [ ] `npx tsc --noEmit` in `app_user`
- [ ] `npx tsc --noEmit` in `app_taixe`
- [ ] `bun lint` in `app_user` (if available)
- [ ] `bun lint` in `app_taixe` (if available)
- [ ] Manual verification: call all 4 OTP endpoints via curl/HTTPie
- [ ] Manual verification: auth guard redirect in both apps

## API Contract

### POST /api/v1/auth/otp/request
```
Request:  { "phone": "+84912345678" }
Response: { "success": true, "expiresIn": 300 }
Status:   200
Errors:   400 (invalid phone format)
```

### POST /api/v1/auth/otp/verify
```
Request:  { "phone": "+84912345678", "code": "000000" }
Response: {
  "accessToken": "eyJ...",
  "refreshToken": "a1b2c3d4-...",
  "user": { "id": "uuid", "phone": "+84912345678", "name": null, "email": null, "role": "CUSTOMER" }
}
Status:   200
Errors:   401 (invalid OTP code)
```

### POST /api/v1/auth/refresh
```
Request:  { "refreshToken": "a1b2c3d4-..." }
Response: { "accessToken": "eyJ...", "refreshToken": "e5f6g7h8-..." }
Status:   200
Errors:   401 (invalid/expired refresh token)
```

### POST /api/v1/auth/logout
```
Request:  { "refreshToken": "a1b2c3d4-..." }
Response: { "success": true }
Status:   200
```

## Database / Migration Impact

- **No Prisma schema migration.** The `phone` field already exists on `User` model as `String?`.
- OTP-created users: `user_name = phone`, `password_hash = 'otp-only'` (placeholder, never used for password login).
- New `Customer` profile created for first-time OTP users via `prisma.customer.create()`.
- Risk: `phone` has no unique constraint. Two simultaneous OTP verifies for same phone could theoretically create duplicates. Mitigation: wrap create in try/catch, retry with find. Acceptable for dev.

## Security / Secrets / Auth Impact

- JWT payload changes from `{ sub, user_name, role }` to `{ sub, phone, role }`. The `user_name` field is dropped from new OTP tokens. Legacy tokens (username/password login) still include `user_name`. The `JwtPayload` type is updated to reflect the new shape.
- `JwtStrategy.validate()` returns the payload as-is. Any guard/decorator reading `user_name` from the payload will break for OTP tokens. Check all consumers of `CurrentUser` decorator.
- Refresh tokens stored in Redis with key pattern `refresh_token:<uuid>`, TTL 30 days.
- DEV mode: OTP code `000000` always accepted. No SMS sent.
- All 4 new endpoints are public (no JWT guard). `/auth/refresh` and `/auth/logout` use refresh token in body, not Bearer header.

## Implementation Constraints

1. **Redis path**: `RedisModule` is at `api/common/redis/redis.module` (NOT `api/redis/`). It is `@Global()`, so `RedisService` can be injected directly into `AuthService` without importing the module in `AuthModule`. However, for explicitness, the plan imports it in `AuthModule`.

2. **Refresh token storage**: Use `RedisService.getClient()` directly (not `CacheService`) because `CacheService` prepends `cache:` prefix. Refresh tokens need the `refresh_token:` prefix pattern.

3. **Interceptor refresh call**: The refresh HTTP call inside the 401 interceptor MUST use a separate Axios instance or raw `fetch` to avoid infinite interceptor loop. Do NOT use the shared `apiClient` for the refresh call.

4. **Concurrent refresh**: Use module-level `isRefreshing` flag + `failedQueue` array to prevent multiple concurrent refresh calls. Queue subsequent 401 retries until refresh completes.

5. **Frontend authService already has mock**: `authService.ts` in both apps has `__DEV__` mock for OTP endpoints. The implementer should NOT remove the mock -- the mock is bypassed when `__DEV__` is false (production builds). The backend endpoints must match the mock's expected request/response shapes exactly.

6. **authService.logout() signature**: Currently `logout()` sends `POST /auth/logout` with no body. The new backend endpoint expects `{ refreshToken }` in body. The interceptor (not authService) should handle calling the refresh endpoint and logout endpoint with the correct body.

7. **camelCase response**: New OTP endpoints return camelCase (`accessToken`, `refreshToken`). Legacy endpoints keep snake_case (`access_token`). No mixing.

8. **Phone validation**: E.164 format for Vietnam: `+84` followed by 9 digits. Regex: `/^\+84\d{9}$/`.

## Scope Expansion History

(none yet)

## Escalation Triggers

- If `phone` field needs `@unique` constraint (requires Prisma migration), escalate to architect.
- If existing `CurrentUser` decorator consumers break due to JWT payload change, escalate.
- If `Customer` model doesn't exist in Prisma schema, escalate.

## User Approvals

- Plan approved by user on 2026-07-08.

## Status

READY_FOR_IMPLEMENTING
