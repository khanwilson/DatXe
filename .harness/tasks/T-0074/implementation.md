# Implementation Details: T-0074

## Summary
Implemented the complete Phone + OTP authentication flow end-to-end including:
1. Backend: 4 new OTP/token endpoints alongside existing username/password endpoints
2. Frontend app_user: Auth navigation guard in splash screen + automatic token refresh on 401 in Axios interceptor
3. Frontend app_taixe: Same auth guard + refresh interceptor as app_user

## Changes Made

### Backend (nestjs_prisma)
1. Created 6 new DTO files in `api/auth/dto/`:
   - `request-otp.dto.ts` — phone validation (E.164 VN: `+84xxxxxxxxx`)
   - `verify-otp.dto.ts` — phone + code
   - `refresh-token.dto.ts` — refreshToken
   - `otp-response.dto.ts` — success + expiresIn
   - `otp-verify-response.dto.ts` — accessToken, refreshToken, user
   - `refresh-response.dto.ts` — accessToken, refreshToken

2. Modified `api/auth/types/jwt-payload.type.ts`:
   - Added `phone: string` and `role: string`
   - Kept `sub: string`

3. Enhanced `api/auth/auth.service.ts`:
   - Injected `RedisService` from `api/common/redis/redis.service`
   - Implemented `requestOtp(phone)` — DEV mode: log `000000`, return `{ success: true, expiresIn: 300 }`
   - Implemented `verifyOtp(phone, code)` — DEV: accept `000000`. Find-or-create User (user_name=phone, password_hash='otp-only', role=CUSTOMER). Create Customer profile. Generate JWT (payload: `{ sub: userId, phone, role }`, 1d expiry). Generate refresh token (UUID), store in Redis key `refresh_token:<token>` with value `{ userId, phone }`, TTL 30d. Return `{ accessToken, refreshToken, user }`.
   - Implemented `refreshToken(token)` — Look up Redis. If not found: throw Unauthorized. Delete old token. Generate new access + refresh tokens (rotation). Return `{ accessToken, refreshToken }`.
   - Implemented `logout(refreshToken)` — Delete Redis key. Return `{ success: true }`.

4. Enhanced `api/auth/auth.controller.ts`:
   - Added `POST /auth/otp/request` — public, uses RequestOtpDto
   - Added `POST /auth/otp/verify` — public, uses VerifyOtpDto
   - Added `POST /auth/refresh` — public, uses RefreshTokenDto
   - Added `POST /auth/logout` — public, uses RefreshTokenDto

5. Modified `api/auth/auth.module.ts`:
   - Imported `RedisModule` from `api/common/redis/redis.module`

### Frontend app_user
1. Modified `app/index.tsx`:
   - After splash delay, check `ZustandPersist.getState().accessToken`
   - If present: navigate to `/(tabs)/HomeScreen`
   - If absent: navigate to `/SigninStack/SigninScreen`

2. Enhanced `src/api/axios/interceptors.ts`:
   - Implemented token refresh logic
   - Added module-level `isRefreshing` flag + `failedQueue` array
   - On 401: if already refreshing, queue request. Else: get refreshToken from Zustand, call `POST /auth/refresh` using a SEPARATE Axios instance to avoid infinite loop. Update Zustand with new tokens. Retry original request. On failure: call logout(), reject queue.

### Frontend app_taixe
1. Modified `app/index.tsx`:
   - Same as app_user: After splash delay, check `ZustandPersist.getState().accessToken`
   - If present: navigate to `/(tabs)/HomeScreen`
   - If absent: navigate to `/SigninStack/SigninScreen`

2. Enhanced `src/api/axios/interceptors.ts`:
   - Same as app_user: Implemented token refresh logic with module-level `isRefreshing` flag + `failedQueue` array
   - On 401: if already refreshing, queue request. Else: get refreshToken from Zustand, call `POST /auth/refresh` using a SEPARATE Axios instance to avoid infinite loop. Update Zustand with new tokens. Retry original request. On failure: call logout(), reject queue.