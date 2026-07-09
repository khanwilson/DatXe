# Fix Notes: T-0074

## Summary
Applied two fixes to address issues identified in the evaluation:

1. **Fixed inverted OTP verification logic** in `nestjs_prisma/api/auth/auth.service.ts`
2. **Fixed lint warning** in both app interceptors files regarding Array type syntax

## Fix 1: Inverted OTP Verification Logic

**File:** `/Users/chubo/Work/DatXe/nestjs_prisma/api/auth/auth.service.ts`

**Issue:** The original condition `if (process.env.NODE_ENV !== 'production' && dto.code !== '000000')` was inverted, causing all OTP codes to pass in production.

**Fix Applied:**
```ts
// Before:
if (process.env.NODE_ENV !== 'production' && dto.code !== '000000') {
  throw new UnauthorizedException('Invalid OTP code');
}

// After:
const isDevBypass = process.env.NODE_ENV !== 'production' && dto.code === '000000';
if (!isDevBypass) {
  throw new UnauthorizedException('Invalid OTP code');
}
```

**Effect:** 
- DEV mode: accepts `000000`, rejects all other codes (correct)
- Production: rejects all codes (correct for DEV-only feature without real SMS OTP)

## Fix 2: Lint Warning in Interceptors

**Files:** 
- `/Users/chubo/Work/DatXe/app_user/src/api/axios/interceptors.ts`
- `/Users/chubo/Work/DatXe/app_taixe/src/api/axios/interceptors.ts`

**Issue:** ESLint rule `@typescript-eslint/array-type` forbids `Array<T>`, requires `T[]`.

**Fix Applied:**
```ts
// Before:
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

// After:
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = [];
```

Both fixes are within the allowed files and maintain the intended functionality while addressing the security concern and lint warning.