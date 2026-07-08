# Plan: T-0074

## Goal

Implement the complete Phone + OTP authentication flow end-to-end:
1. Backend: OTP verify endpoint that finds-or-creates User by phone, issues access token + refresh token (Redis-backed).
2. Frontend app_user: Auth navigation guard (redirect to signin if no token), automatic token refresh on 401 in Axios interceptor.
3. Frontend app_taixe: Same auth guard + refresh interceptor as app_user.

## Requirements

- Backend `POST /auth/otp/verify` accepts `{ phone, code }`, DEV mode accepts code `000000`, creates User (role=CUSTOMER) + Customer profile if phone is new, returns `{ accessToken, refreshToken, user }`.
- Backend `POST /auth/otp/request` accepts `{ phone }`, validates phone format, returns `{ success, expiresIn }`. DEV: no actual SMS sent.
- Backend `POST /auth/refresh` accepts `{ refreshToken }`, validates against Redis, returns new `{ accessToken, refreshToken }`.
- Backend `POST /auth/logout` accepts `{ refreshToken }`, deletes from Redis.
- Refresh tokens stored in Redis with 30-day TTL (Redis already available from T-0003).
- Access token (JWT) contains `{ sub, phone, role }`, expires in 1 day.
- Frontend: splash screen checks for access token; if absent, redirect to SigninStack.
- Frontend: Axios interceptor catches 401, calls refresh endpoint, retries original request. Only one concurrent refresh.
- Both apps (app_user, app_taixe) receive identical frontend changes.

## Assumptions

- DEV mode (`process.env.NODE_ENV !== 'production'`): OTP code `000000` is always accepted. No SMS integration.
- Phone number format: E.164 (`+84xxxxxxxxx`), validated on backend.
- New users created via OTP get `role=CUSTOMER` by default. Driver accounts will be created separately (not in this task).
- Existing `user_name`/`password_hash` auth endpoints remain untouched (no breaking change).
- Redis is available and healthy (T-0003).
- Mobile apps already have the OTP UI (SigninScreen + OtpScreen) and Zustand store with `setTokens`/`logout` actions.
- Response DTOs use camelCase to match mobile app expectations (existing `access_token` snake_case DTO is for legacy endpoints only).

## Affected Areas

| Project | Area | Change Type |
|---------|------|-------------|
| nestjs_prisma | `api/auth/` — new DTOs, service methods, controller endpoints | New code |
| nestjs_prisma | `api/auth/types/jwt-payload.type.ts` — add `phone`, `role` | Modify |
| nestjs_prisma | `api/auth/auth.module.ts` — ensure RedisModule imported | Modify |
| nestjs_prisma | Prisma schema — no migration (phone field already exists, unique lookup handled at service level) | No change |
| app_user | `app/index.tsx` — auth guard | Modify |
| app_user | `src/api/axios/interceptors.ts` — refresh-on-401 logic | Modify |
| app_taixe | `app/index.tsx` — auth guard | Modify |
| app_taixe | `src/api/axios/interceptors.ts` — refresh-on-401 logic | Modify |

## Current Context Read

### Backend Auth (legacy)
- `api/auth/auth.controller.ts`: `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` (username/password).
- `api/auth/auth.service.ts`: bcrypt password hashing, JWT signing with `{ sub, user_name, role }`.
- `api/auth/auth.module.ts`: JwtModule configured with `JWT_SECRET` env, `JWT_EXPIRES_IN='1d'`.
- `api/auth/types/jwt-payload.type.ts`: `{ sub: string, user_name: string }` — missing `role` and `phone`.
- `api/auth/dto/auth-response.dto.ts`: `{ access_token, user: { id, user_name, created_at, updated_at } }` — does not match mobile expectation.

### Mobile Auth (already coded against future backend)
- `authService.ts` (both apps): expects `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/refresh`, `POST /auth/logout`.
- `VerifyOtpResponse` type: `{ accessToken: string, refreshToken: string, user: { id, phone, name?, email? } }`.
- `useVerifyOtp` hook: on success, calls `ZustandPersist.getState().setTokens(accessToken, refreshToken)` + `setUser(user)`.
- `app/index.tsx` (both apps): splash screen navigates to `/(tabs)/HomeScreen` without checking auth. Auth redirect is commented out.
- `interceptors.ts` (both apps): on 401, calls `logout()` — no refresh attempt.
- Zustand `persist.ts`: has `accessToken`, `refreshToken`, `user`, `setTokens()`, `logout()` — all ready.

### Prisma User Model
```
model User {
  id            String      @id @default(uuid())
  user_name     String      @unique
  password_hash String
  role          UserRole    @default(CUSTOMER)
  phone         String?
  avatar        String?
  status        UserStatus  @default(ACTIVE)
  ...
}
```
- `phone` is optional, no unique constraint.
- `user_name` is unique and required.
- For OTP-created users: `user_name` will be set to phone (or a generated value), `password_hash` set to a placeholder.

### Redis
- `RedisModule` / `CacheService` available from T-0003.
- Can use `CacheService` or inject `Redis` client directly for refresh token storage.

## Proposed Approach

### Backend Strategy

1. **New OTP endpoints** alongside existing username/password endpoints (no breaking changes).
2. **User creation for OTP**: `user_name = phone`, `password_hash = 'otp-only'` (placeholder, never used for login). Phone-based lookup via `prisma.user.findUnique({ where: { phone } })`.
3. **Refresh tokens in Redis**: key = `refresh_token:<token_uuid>`, value = `{ userId, phone, role }`, TTL = 30 days.
4. **JWT payload**: `{ sub: userId, phone, role }` — enables guards to check role without DB lookup.
5. **Response format**: camelCase to match mobile apps (`accessToken`, `refreshToken`, `user: { id, phone, name, email, role }`).

### Frontend Strategy

1. **Auth guard in splash**: check `ZustandPersist.getState().accessToken`. If present, go to Home. If absent, go to SigninStack.
2. **Refresh interceptor**: on 401, get `refreshToken` from Zustand, call `POST /auth/refresh`, update tokens in Zustand, retry original request. Use a module-level `isRefreshing` flag + request queue to prevent concurrent refreshes.
3. **Both apps get identical changes** (auth guard + interceptor).

## Phases / Steps

### Phase 1: Backend — Auth DTOs and Types

**Files to create/modify:**

1. `nestjs_prisma/api/auth/types/jwt-payload.type.ts` — Add `phone: string` and `role: UserRole`:
   ```ts
   export type JwtPayload = {
     sub: string;
     phone: string;
     role: string;
   };
   ```

2. `nestjs_prisma/api/auth/dto/request-otp.dto.ts` — New:
   ```ts
   export class RequestOtpDto {
     @IsString() @Matches(/^\+84\d{9}$/) phone: string;
   }
   ```

3. `nestjs_prisma/api/auth/dto/verify-otp.dto.ts` — New:
   ```ts
   export class VerifyOtpDto {
     @IsString() phone: string;
     @IsString() @Length(6, 6) code: string;
   }
   ```

4. `nestjs_prisma/api/auth/dto/refresh-token.dto.ts` — New:
   ```ts
   export class RefreshTokenDto {
     @IsString() refreshToken: string;
   }
   ```

5. `nestjs_prisma/api/auth/dto/otp-response.dto.ts` — New:
   ```ts
   export class OtpResponseDto {
     success: boolean;
     expiresIn: number;
   }
   ```

6. `nestjs_prisma/api/auth/dto/otp-verify-response.dto.ts` — New:
   ```ts
   export class OtpVerifyResponseDto {
     accessToken: string;
     refreshToken: string;
     user: { id: string; phone: string; name: string | null; email: string | null; role: string };
   }
   ```

7. `nestjs_prisma/api/auth/dto/refresh-response.dto.ts` — New:
   ```ts
   export class RefreshResponseDto {
     accessToken: string;
     refreshToken: string;
   }
   ```

### Phase 2: Backend — Auth Service OTP Methods

**File:** `nestjs_prisma/api/auth/auth.service.ts`

Add methods:

1. `requestOtp(phone: string)`:
   - Validate phone format (E.164 VN).
   - In DEV: log OTP `000000` to console, return `{ success: true, expiresIn: 300 }`.
   - (Future: generate random 6-digit code, store in Redis with 5-min TTL, send via SMS provider.)

2. `verifyOtp(phone: string, code: string)`:
   - DEV mode: accept code `000000`. Non-dev: check Redis for stored OTP.
   - Find user by phone: `prisma.user.findUnique({ where: { phone } })`.
   - If not found: create User with `user_name = phone`, `password_hash = 'otp-only'`, `phone`, `role = CUSTOMER`. Then create Customer profile: `prisma.customer.create({ data: { user_id: user.id } })`.
   - Generate access token (JWT, 1d expiry, payload `{ sub: user.id, phone: user.phone, role: user.role }`).
   - Generate refresh token (crypto.randomUUID()), store in Redis key `refresh_token:<token>` with value `{ userId: user.id, phone: user.phone }`, TTL 30 days.
   - Return `{ accessToken, refreshToken, user: { id, phone, name: null, email: null, role } }`.

3. `refreshToken(token: string)`:
   - Look up Redis key `refresh_token:<token>`.
   - If not found: throw `UnauthorizedException`.
   - Delete old refresh token from Redis.
   - Look up user by ID from stored value.
   - Generate new access token + new refresh token (rotation).
   - Return `{ accessToken, refreshToken }`.

4. `logout(refreshToken: string)`:
   - Delete Redis key `refresh_token:<refreshToken>`.
   - Return `{ success: true }`.

**Dependency injection:** Inject Redis client (from `RedisModule`) into `AuthService`.

### Phase 3: Backend — Auth Controller OTP Endpoints

**File:** `nestjs_prisma/api/auth/auth.controller.ts`

Add routes:

```
POST /auth/otp/request   → requestOtp(body: RequestOtpDto) → OtpResponseDto
POST /auth/otp/verify    → verifyOtp(body: VerifyOtpDto) → OtpVerifyResponseDto
POST /auth/refresh        → refreshToken(body: RefreshTokenDto) → RefreshResponseDto
POST /auth/logout         → logout(body: RefreshTokenDto) → { success: true }
```

- `/auth/otp/request` and `/auth/otp/verify` are public (no guard).
- `/auth/refresh` is public (uses refresh token, not access token).
- `/auth/logout` is public (uses refresh token in body).

### Phase 4: Backend — Module Wiring

**File:** `nestjs_prisma/api/auth/auth.module.ts`

- Import `RedisModule` (from `api/redis/redis.module`) so `AuthService` can inject the Redis client.
- No changes to existing JwtModule config (it already reads `JWT_SECRET` and `JWT_EXPIRES_IN`).

### Phase 5: Frontend app_user — Auth Navigation Guard

**File:** `app_user/app/index.tsx`

Modify splash screen logic:
```
After 2.5s delay:
  if hasSeenOnboarding:
    if ZustandPersist.accessToken exists:
      router.replace('/(tabs)/HomeScreen')
    else:
      router.replace('/SigninStack/SigninScreen')
  else:
    router.replace('/onboarding/welcome')
```

### Phase 6: Frontend app_user — Token Refresh Interceptor

**File:** `app_user/src/api/axios/interceptors.ts`

Replace the current 401 handler with refresh logic:

```
On 401 response error:
  if already retrying (isRefreshing flag):
    queue the request, return pending promise
  if no refreshToken in Zustand:
    call logout(), reject
  set isRefreshing = true
  try:
    call POST /auth/refresh with { refreshToken }
    update Zustand: setTokens(newAccessToken, newRefreshToken)
    retry original request with new access token
  catch:
    call logout()
    reject all queued requests
  finally:
    isRefreshing = false
```

Key implementation details:
- Module-level `let isRefreshing = false` and `let failedQueue: Array<{ resolve, reject }>`.
- The refresh call uses a fresh Axios instance (or raw fetch) to avoid infinite interceptor loop.
- On successful refresh, process the failed queue with the new token.

### Phase 7: Frontend app_taixe — Auth Navigation Guard

**File:** `app_taixe/app/index.tsx`

Same change as Phase 5 (app_user).

### Phase 8: Frontend app_taixe — Token Refresh Interceptor

**File:** `app_taixe/src/api/axios/interceptors.ts`

Same change as Phase 6 (app_user).

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Phone not unique in User model | Race condition: two simultaneous OTP verifies for same phone could create duplicate users | Use `try/catch` on `prisma.user.create` with unique constraint check. For dev, this is acceptable. Future: add `@unique` to `phone` field in Prisma schema. |
| `user_name` required field for OTP users | OTP users don't have a real username | Set `user_name = phone` for OTP-created users. This is a reasonable default. |
| `password_hash` required field for OTP users | OTP users don't have a password | Set `password_hash = 'otp-only'` placeholder. Legacy login endpoint will fail bcrypt comparison (acceptable — OTP users can't use password login). |
| Refresh token Redis key collision | UUID collision is astronomically unlikely | Use `crypto.randomUUID()` — sufficient for dev/staging. |
| Interceptor infinite loop | If refresh endpoint itself returns 401, interceptor could loop | Use a separate Axios instance (or `fetch`) for the refresh call that bypasses the interceptor. |
| JWT payload change breaks existing guards | Adding `phone` and `role` to payload, removing `user_name` | Check all consumers of `JwtPayload` type. The WebSocket guard already reads `role` from payload (it was being signed but not typed). The `CurrentUser` decorator returns `JwtPayload`. Update type to match reality. |
| camelCase vs snake_case mismatch | Mobile expects camelCase, existing backend uses snake_case | New OTP endpoints return camelCase. Legacy endpoints keep snake_case. No breaking change. |

## Architect Required?

No

The task touches auth (which is a security boundary), but the implementation is straightforward:
- OTP endpoints follow a well-defined pattern already designed in D-0005.
- Refresh token in Redis is a standard approach.
- Frontend changes are mechanical (auth guard + interceptor).
- No schema migration required.
- No cross-module boundary changes.

If the team wants to discuss refresh token rotation strategy, token blacklist for logout, or rate-limiting OTP requests, those can be addressed in review.

## Contracting Notes

### Allowed Files

**nestjs_prisma:**
- `api/auth/auth.module.ts`
- `api/auth/auth.service.ts`
- `api/auth/auth.controller.ts`
- `api/auth/types/jwt-payload.type.ts`
- `api/auth/dto/request-otp.dto.ts` (new)
- `api/auth/dto/verify-otp.dto.ts` (new)
- `api/auth/dto/refresh-token.dto.ts` (new)
- `api/auth/dto/otp-response.dto.ts` (new)
- `api/auth/dto/otp-verify-response.dto.ts` (new)
- `api/auth/dto/refresh-response.dto.ts` (new)

**app_user:**
- `app/index.tsx`
- `src/api/axios/interceptors.ts`

**app_taixe:**
- `app/index.tsx`
- `src/api/axios/interceptors.ts`

### Out of Scope
- Prisma schema migration (no `@@unique` on phone in this task).
- SMS provider integration (DEV mock only).
- Driver account creation via OTP (this task creates CUSTOMER users only; driver auth uses the same endpoint but driver accounts are pre-seeded or created separately).
- Rate limiting on OTP endpoints.
- Token blacklist for access tokens (only refresh tokens are tracked).
- SignupScreen cleanup (orphaned stub — separate task).
- Changes to `app_user` or `app_taixe` files beyond the 2 listed per app.

### API Contract

**POST /api/v1/auth/otp/request**
```
Request:  { "phone": "+84912345678" }
Response: { "success": true, "expiresIn": 300 }
Status:   200
Errors:   400 (invalid phone format)
```

**POST /api/v1/auth/otp/verify**
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

**POST /api/v1/auth/refresh**
```
Request:  { "refreshToken": "a1b2c3d4-..." }
Response: { "accessToken": "eyJ...", "refreshToken": "e5f6g7h8-..." }
Status:   200
Errors:   401 (invalid/expired refresh token)
```

**POST /api/v1/auth/logout**
```
Request:  { "refreshToken": "a1b2c3d4-..." }
Response: { "success": true }
Status:   200
```

### Acceptance Criteria

1. `POST /auth/otp/request` with valid VN phone returns `{ success: true, expiresIn: 300 }`.
2. `POST /auth/otp/verify` with phone + code `000000` (DEV) creates User + Customer if new, returns `{ accessToken, refreshToken, user }`.
3. `POST /auth/otp/verify` with same phone returns same user (find-or-create).
4. `POST /auth/otp/verify` with wrong code returns 401.
5. `POST /auth/refresh` with valid refresh token returns new token pair, old token is invalidated.
6. `POST /auth/refresh` with invalid/expired token returns 401.
7. `POST /auth/logout` removes refresh token from Redis.
8. app_user: opening app without token redirects to SigninStack.
9. app_user: opening app with valid token redirects to HomeScreen.
10. app_user: 401 response triggers refresh, retries original request.
11. app_taixe: same as items 8-10.
12. Existing `/auth/login` and `/auth/register` endpoints still work (no regression).

## Testing Strategy

1. **Backend unit tests** (if Jest is configured):
   - `AuthService.requestOtp` — returns success for valid phone.
   - `AuthService.verifyOtp` — creates user on first call, finds user on subsequent calls, rejects wrong code.
   - `AuthService.refreshToken` — rotates tokens, rejects invalid token.
   - `AuthService.logout` — removes token from Redis.

2. **Manual testing:**
   - Start backend, call `POST /auth/otp/request` with `+84912345678`.
   - Call `POST /auth/otp/verify` with `+84912345678` + `000000`. Verify response shape.
   - Use returned `accessToken` to call `GET /auth/profile`.
   - Call `POST /auth/refresh` with the `refreshToken`. Verify new tokens.
   - Call `POST /auth/refresh` with old `refreshToken`. Verify 401.
   - Call `POST /auth/logout` with new `refreshToken`. Verify it's invalidated.

3. **Frontend manual testing:**
   - Clear app storage, open app_user. Verify redirect to SigninScreen.
   - Complete OTP flow with `000000`. Verify redirect to HomeScreen.
   - Close and reopen app. Verify direct redirect to HomeScreen (token persisted).
   - Repeat for app_taixe.

4. **Build/lint/typecheck:**
   - `bun run build` in nestjs_prisma.
   - `npx tsc --noEmit` in app_user and app_taixe.

## Estimated Effort

- Phase 1 (DTOs + types): 30 min
- Phase 2 (Service methods): 60 min
- Phase 3 (Controller endpoints): 20 min
- Phase 4 (Module wiring): 10 min
- Phase 5 (app_user auth guard): 15 min
- Phase 6 (app_user refresh interceptor): 45 min
- Phase 7 (app_taixe auth guard): 15 min
- Phase 8 (app_taixe refresh interceptor): 30 min
- Testing + fixes: 30 min

**Total: ~4 hours**

## Approval Gate

Waiting for user approval before Contracting.
