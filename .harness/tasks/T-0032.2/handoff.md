# Handoff

**Task ID**: T-0032.2
**Title**: Permissions screen — wire real OS permission requests (Location & Notifications)
**Completed**: 2026-06-26
**Duration**: ~1 giờ

---

## Summary

Màn `app_user/app/onboarding/permissions.tsx` trước đây chỉ là UI giả (nút Allow chỉ delay rồi điều hướng). Đã wire request quyền OS thật: **Location (foreground)** qua `expo-location` và **Notifications** qua `expo-notifications`. Flow non-blocking: allow/deny đều đi tiếp sang get-started.

---

## What Was Delivered

- Request quyền thật khi tap "Allow Permissions" (Location foreground + Notifications).
- State `isRequesting` chống double-tap; nút disable + text "Requesting..." khi đang chờ.
- Skip vẫn hoạt động, không request.
- `app.json`: thêm plugin `expo-location` (usage description tiếng Việt) + `expo-notifications`.
- Thêm 2 dependency Expo-pinned.

---

## API Changes

None — không đụng backend.

---

## Database Changes

None — không đụng Prisma.

---

## Lessons Learned

### What Went Well
- `expo install` pin version khớp SDK 54 tự động, không lo mismatch.
- Static checks (lint + tsc) pass ngay lần đầu.

### What Was Challenging
- Quyền thật không test được trong môi trường này (managed Expo, cần device/EAS build) → để manual test plan trong evaluation.

### What We'd Do Differently
- Có thể tách helper `requestOnboardingPermissions()` ra `src/utils` nếu sau này nhiều màn dùng lại — hiện chưa cần.

---

## Next Steps

### Immediate Next Tasks
1. Manual test trên device/simulator theo plan trong `evaluation.md`.
2. (Sau) Xin quyền theo ngữ cảnh ở các màn khác:
   - Contacts → màn liên hệ
   - Camera / Photo Library → màn đổi profile

### Known Technical Debt
- Chưa kiểm tra lại trạng thái quyền tại điểm sử dụng thực (đặt xe). Khi build màn home/map (T-0034) cần check `getForegroundPermissionsAsync` và nhắc lại nếu bị deny — Priority: Medium.
- Notifications mới chỉ request quyền, chưa đăng ký push token / handler — Priority: Low (ngoài scope onboarding).

---

## Testing Coverage

- Unit tests: project không có test runner → skipped.
- Static: lint ✓, typecheck ✓.
- Manual device test: pending (xem evaluation.md).

---

## Performance Impact

- Không đáng kể. 2 lời gọi async permission khi user chủ động tap, không ảnh hưởng startup.

---

## Security Review

- [x] No hard-coded secrets
- [x] Input validation: N/A (không có input)
- [x] Authentication/authorization: N/A
- [x] Chỉ xin quyền tối thiểu cần thiết (least-privilege) — foreground location, không background
- [x] Usage description rõ ràng cho user

---

## Deployment Notes

### Prerequisites
- Cần native rebuild (EAS build hoặc `expo prebuild`) để plugin `expo-location`/`expo-notifications` inject usage strings + permissions vào native project. Dev client cũ không có 2 module này sẽ phải build lại.

### Deployment Steps
1. `bun install` (lockfile đã cập nhật).
2. Rebuild dev client / EAS build.
3. Manual test theo plan.

### Rollback Plan
- Revert `permissions.tsx`, `app.json`, `package.json`, `bun.lock` về commit trước; gỡ 2 dependency.

---

## File Changes Summary

- **Projects Modified**: app_user
- **Files Changed**: 4 code/config (`permissions.tsx`, `app.json`, `package.json`, `bun.lock`) + harness docs
- Xem `files-changed.md` để biết chi tiết.

---

## Approvals

- **Task Owner**: nathan
- **Code Reviewer**: -
- **Approved**: 2026-06-26 (static); manual device test pending
