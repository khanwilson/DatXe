# Evaluation: T-0074

## Summary

Implementation of the complete Phone + OTP auth flow is substantially correct. All 14 allowed files were changed and no out-of-scope files were touched. The backend build and both frontend typechecks pass clean. Lint produces warnings only (0 errors). One fixable logic bug was found in `auth.service.ts`: the `verifyOtp` DEV guard condition is inverted, causing all OTP codes to pass in production (any code accepted when `NODE_ENV === 'production'`). One new lint warning was introduced in `interceptors.ts` (Array type style). Both issues are inside Allowed Files.

Decision: FAIL_FIXABLE

---

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `cd /Users/chubo/Work/DatXe/nestjs_prisma && bun run build` | PASS | No errors, no output |
| `cd /Users/chubo/Work/DatXe/app_user && npx tsc --noEmit` | PASS | No type errors |
| `cd /Users/chubo/Work/DatXe/app_taixe && npx tsc --noEmit` | PASS | No type errors |
| `cd /Users/chubo/Work/DatXe/app_user && bun lint` | PASS (warnings only) | 4 warnings, 0 errors. 1 new warning from this task in `interceptors.ts` line 22. |
| `cd /Users/chubo/Work/DatXe/app_taixe && bun lint` | PASS (warnings only) | 5 warnings, 0 errors. 1 new warning from this task in `interceptors.ts` line 22. |

---

## Contract Compliance

All 14 files listed in `Allowed Files` were changed. No files outside the allowed set were modified.

Files-changed.md matches the contract exactly:

- nestjs_prisma: `auth.service.ts`, `auth.controller.ts`, `auth.module.ts`, `types/jwt-payload.type.ts` (modify) — confirmed.
- nestjs_prisma: 6 new DTOs — confirmed.
- app_user: `app/index.tsx`, `src/api/axios/interceptors.ts` — confirmed.
- app_taixe: `app/index.tsx`, `src/api/axios/interceptors.ts` — confirmed.

Protected files verified untouched (by absence of entries in files-changed.md and code review):
- `prisma/schema.prisma` — not modified.
- `dto/auth-response.dto.ts`, `dto/login.dto.ts`, `dto/register.dto.ts` — not modified.
- `strategies/jwt.strategy.ts` — not modified.
- All other app_user / app_taixe files — not modified.

---

## Acceptance Criteria

| Criterion | Result | Evidence |
|---|---|---|
| 1. `POST /auth/otp/request` with valid VN phone returns `{ success: true, expiresIn: 300 }` | PASS | `auth.service.ts:108–124` returns hardcoded `{ success: true, expiresIn: 300 }`. DTO validates `+84xxxxxxxxx` regex. |
| 2. `POST /auth/otp/verify` with phone + code `000000` (DEV) creates User + Customer, returns `{ accessToken, refreshToken, user }` | FAIL | Logic bug: condition at line 128 rejects any code != `000000` in DEV, but passes all codes in production. In DEV it works. See Failures section. |
| 3. Same phone returns same user (find-or-create) | PASS | `findFirst` then create with try/catch fallback to `findFirstOrThrow`. |
| 4. `POST /auth/otp/verify` with wrong code returns 401 | PARTIAL | Works correctly in DEV (rejects != `000000`). In production any code passes (bug). |
| 5. `POST /auth/refresh` returns new token pair, old invalidated | PASS | `del` old key then `setex` new key with rotation. Code review confirms correct. |
| 6. `POST /auth/refresh` with invalid/expired token returns 401 | PASS | `if (!storedData) throw new UnauthorizedException(...)` at line 206. |
| 7. `POST /auth/logout` removes refresh token, returns `{ success: true }` | PASS | `del` key + return `{ success: true }`. |
| 8. app_user: no token → redirect to SigninStack/SigninScreen | PASS | `app_user/app/index.tsx:41–46`: checks `ZustandPersist.getState().accessToken`, routes to `/SigninStack/SigninScreen` when absent. |
| 9. app_user: valid token → redirect to `/(tabs)/HomeScreen` | PASS | Same block, routes to `/(tabs)/HomeScreen` when token present. |
| 10. app_user: 401 triggers refresh + retry | PASS | `interceptors.ts` implements `isRefreshing` flag + `failedQueue` + separate Axios instance for refresh call. |
| 11. app_taixe: same as items 8–10 | PASS | Identical logic in `app_taixe/app/index.tsx` and `app_taixe/src/api/axios/interceptors.ts`. |
| 12. Existing `/auth/login` and `/auth/register` no regression | PASS | `register()`, `login()`, `getProfile()`, `buildAuthResponse()` are unchanged. `JwtPayload` type change (`phone`/`role` added, `user_name` removed) does not affect existing methods — `buildAuthResponse` signs with `user_name` directly (not from `JwtPayload` type), so there is no type error and no runtime regression. |

---

## Security / Secrets Check

- No hard-coded secrets or API keys found in any changed file.
- `JWT_SECRET` is read from `ConfigService` (env var), unchanged.
- Redis host/port/password are read from `process.env`, unchanged.
- DEV OTP `000000` is logged to console (acceptable — log level is `console.log` which is an ESLint error by project rules, but this is in nestjs_prisma which does not enforce the same ESLint config; no issue).
- The `password_hash = 'otp-only'` placeholder is safe — it will always fail bcrypt comparison since bcrypt hashes begin with `$2b$`.
- Refresh tokens are UUID v4 — sufficient entropy for this use case.
- The separate Axios instance for the refresh call correctly avoids interceptor loop.
- No injection risks in Redis key construction (`refresh_token:${token}` where token is a UUID).

One security concern (see Failures): the inverted `verifyOtp` guard means that in a production build, any 6-character OTP code passes verification because the only check is skipped when `NODE_ENV === 'production'`. This is a bug, not a design decision.

---

## Failures

### FAIL-1: Inverted OTP verification condition in production

**File:** `/Users/chubo/Work/DatXe/nestjs_prisma/api/auth/auth.service.ts`, line 128

**Current code:**
```ts
if (process.env.NODE_ENV !== 'production' && dto.code !== '000000') {
  throw new UnauthorizedException('Invalid OTP code');
}
```

**Behavior:**
- DEV (`NODE_ENV !== 'production'` is true): rejects codes that are not `000000`. Correct.
- PRODUCTION (`NODE_ENV !== 'production'` is false): the entire condition short-circuits to false → no exception thrown → any code passes. Incorrect and a security regression.

There is no else-branch or Redis-backed OTP verification for production. This means any 6-character string is a valid OTP in production.

**Severity:** High — security regression in production. Fixable within Allowed Files.

### FAIL-2: Lint warning introduced in interceptors.ts (both apps)

**Files:**
- `/Users/chubo/Work/DatXe/app_user/src/api/axios/interceptors.ts`, line 22
- `/Users/chubo/Work/DatXe/app_taixe/src/api/axios/interceptors.ts`, line 22

**Warning:** `Array type using 'Array<T>' is forbidden. Use 'T[]' instead` (`@typescript-eslint/array-type`)

**Current code:**
```ts
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];
```

**Severity:** Warning only (not an error — lint exits 0). Fix is cosmetic and within Allowed Files. Recommended to fix to keep lint clean.

---

## Root Cause

**FAIL-1:** The implementer wrote the DEV guard condition as a conjunction (`!== 'production' && code !== '000000'`) but the intent requires rejecting bad codes in both environments (DEV accepts `000000`; production should validate against Redis — or at minimum always reject bad codes). The correct logic is: always reject codes that don't match, where DEV's special case is `000000` and production would use Redis. Since production Redis OTP is out of scope, the minimum correct fix is to always reject codes not equal to `000000` in DEV and always reject in production (since no real SMS OTP is implemented yet).

**FAIL-2:** The implementer used `Array<T>` generic syntax instead of the project-enforced `T[]` shorthand.

---

## Fix Recommendation

### Fix FAIL-1 — `nestjs_prisma/api/auth/auth.service.ts`

Replace the condition at line 128 with logic that always validates the code:

```ts
// DEV: accept '000000' as a universal bypass. In production,
// a real OTP check against Redis would go here (out of scope for this task).
const isDevBypass = process.env.NODE_ENV !== 'production' && dto.code === '000000';
if (!isDevBypass) {
  throw new UnauthorizedException('Invalid OTP code');
}
```

This ensures that in production, all requests are rejected (correct for a DEV-only feature), while DEV correctly accepts `000000`.

### Fix FAIL-2 — both `interceptors.ts` files

Change line 22 in both files:
```ts
// Before:
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

// After:
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = [];
```

---

## Re-evaluation History

| Run | Date | Decision | Notes |
|---|---|---|---|
| 1 | 2026-07-08 | FAIL_FIXABLE | Initial evaluation. Two issues found: inverted OTP guard (security) and Array type lint warning. |
| 2 | 2026-07-08 | PASS | Re-evaluation after fixes. Both fixes verified correct. All checks pass. |

---

## Decision

PASS

---

## Re-evaluation Run 2 (2026-07-08)

### Fixes Verified

**Fix 1: OTP Verification Logic (CRITICAL)**
- File: `/Users/chubo/Work/DatXe/nestjs_prisma/api/auth/auth.service.ts`, lines 129-132
- New code:
  ```ts
  const isDevBypass = process.env.NODE_ENV !== 'production' && dto.code === '000000';
  if (!isDevBypass) {
    throw new UnauthorizedException('Invalid OTP code');
  }
  ```
- DEV behavior: `isDevBypass` = true when code is `000000` (passes), false for any other code (rejected). CORRECT.
- Production behavior: `isDevBypass` = always false (all codes rejected). CORRECT for DEV-only feature without real SMS OTP.
- Security regression resolved.

**Fix 2: Lint Warnings (MINOR)**
- `/Users/chubo/Work/DatXe/app_user/src/api/axios/interceptors.ts` line 22: now uses `{ resolve: ...; reject: ... }[]` syntax.
- `/Users/chubo/Work/DatXe/app_taixe/src/api/axios/interceptors.ts` line 22: now uses `{ resolve: ...; reject: ... }[]` syntax.
- The `@typescript-eslint/array-type` warning is eliminated from both files.

### Commands Run (Re-evaluation)

| Command | Result | Notes |
|---|---|---|
| `cd nestjs_prisma && bun run build` | PASS | Clean build, no errors |
| `cd app_user && npx tsc --noEmit` | PASS | No type errors |
| `cd app_taixe && npx tsc --noEmit` | PASS | No type errors |
| `cd app_user && bun lint` | PASS | 0 errors, 3 warnings (all pre-existing, none from this task) |
| `cd app_taixe && bun lint` | PASS | 0 errors, 4 warnings (all pre-existing, none from this task) |

### Acceptance Criteria (Re-checked)

| Criterion | Result | Evidence |
|---|---|---|
| 1. POST /auth/otp/request returns { success, expiresIn } | PASS | Unchanged from run 1. |
| 2. POST /auth/otp/verify with 000000 (DEV) creates User + Customer, returns tokens | PASS | Fix 1 confirmed: DEV accepts 000000 correctly. |
| 3. Same phone returns same user (find-or-create) | PASS | Unchanged from run 1. |
| 4. POST /auth/otp/verify with wrong code returns 401 | PASS | Fix 1 confirmed: DEV rejects non-000000 codes; production rejects all codes. |
| 5. POST /auth/refresh returns new token pair, old invalidated | PASS | Unchanged from run 1. |
| 6. POST /auth/refresh with invalid token returns 401 | PASS | Unchanged from run 1. |
| 7. POST /auth/logout removes refresh token | PASS | Unchanged from run 1. |
| 8. app_user: no token redirects to SigninStack/SigninScreen | PASS | Unchanged from run 1. |
| 9. app_user: valid token redirects to /(tabs)/HomeScreen | PASS | Unchanged from run 1. |
| 10. app_user: 401 triggers refresh + retry | PASS | Unchanged from run 1. |
| 11. app_taixe: same as 8-10 | PASS | Unchanged from run 1. |
| 12. Existing /auth/login and /auth/register no regression | PASS | Unchanged from run 1. |

### Contract Compliance
All 14 allowed files changed. No out-of-scope files touched. No new files beyond contract scope.

### Security / Secrets Check
- No hard-coded secrets.
- DEV OTP bypass is properly gated behind `NODE_ENV !== 'production'`.
- Production correctly rejects all OTP codes (no open door).
- Refresh tokens use UUID v4 with Redis-backed rotation.
- No injection risks in Redis key patterns.

### Conclusion
Both FAIL-1 (inverted OTP guard) and FAIL-2 (Array type lint warning) are fully resolved. All 12 acceptance criteria now pass. All required checks pass clean. Task is ready for Reviewing phase.
