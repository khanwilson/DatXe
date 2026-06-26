# Implementation

**Task ID**: T-0032.2
**Phase**: Generating
**Created**: 2026-06-26

---

## Summary

Wire request quyền OS thật vào màn onboarding permissions của app_user. Trước đây nút "Allow Permissions" chỉ `setTimeout(300ms)` rồi điều hướng — không gọi quyền. Nay gọi `expo-location` (foreground) + `expo-notifications` thật.

---

## Changes Made

### 1. `app_user/package.json` + `bun.lock`
- Thêm `expo-location@~19.0.8`, `expo-notifications@~0.32.17` qua `npx expo install` (version khớp SDK 54).

### 2. `app_user/app.json`
- Thêm plugin `expo-location` với `locationWhenInUsePermission` (message tiếng Việt, branding Mai Linh) → sinh `NSLocationWhenInUseUsageDescription` (iOS) + permission Android khi prebuild.
- Thêm plugin `expo-notifications` (cấu hình mặc định).

### 3. `app_user/app/onboarding/permissions.tsx`
- Import `* as Location from 'expo-location'`, `* as Notifications from 'expo-notifications'`.
- Thêm state `isRequesting` chống double-tap.
- `handleRequestAllPermissions` → async:
  - guard nếu đang request;
  - `await Location.requestForegroundPermissionsAsync()`;
  - `await Notifications.requestPermissionsAsync()`;
  - try/catch/finally — `console.warn` khi lỗi (console.log bị ESLint cấm);
  - `finally` luôn `router.push('/onboarding/get-started')` bất kể allow/deny (onboarding non-blocking).
- `handleSkip` → guard `isRequesting`, không request, điều hướng tiếp.
- Nút Allow: text đổi `Requesting...` khi đang chờ; cả 2 nút `disabled={isRequesting}`.

---

## Convention Compliance

- Absolute imports (`theme/index`, `components/*`) — OK.
- Dùng `AppText`/`AppButton` thay RN primitives — OK.
- Comment tiếng Anh — OK.
- `console.warn` (không phải `console.log`) — OK theo eslint config.

---

## Verification

- `npx tsc --noEmit`: ✓ không lỗi ở file thay đổi.
- `bun lint`: ✓ không error/warning.
- Test runner: project không có → skipped.
- Manual: cần chạy trên device/simulator (đề xuất trong handoff).
