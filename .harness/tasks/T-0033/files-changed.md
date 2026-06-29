# Files Changed

**Task ID**: T-0033
**Date**: 2026-06-26

---

## Summary

Total files changed: 13 (11 modified, 1 added code, 1 added doc set)
Lines added: ~213
Lines removed: ~125

---

## By Project

### app_user

```
M app/SigninStack/SigninScreen.tsx        (+/- ~161, refactor → màn nhập SĐT)
A app/SigninStack/OtpScreen.tsx           (mới, màn nhập OTP + countdown)
M app/SigninStack/_layout.tsx             (+1 -1, route OtpScreen, gỡ SignupScreen)
M src/api/hooks/index.ts                  (+1 -1, export hook OTP)
M src/api/hooks/useAuth.ts                (+/- ~33, useRequestOtp/useVerifyOtp)
M src/api/services/authService.ts         (+/- ~83, OTP flow + mock DEV)
M src/api/services/userService.ts         (+3 -2, User shape phone)
M src/components/input/TextInput.tsx      (+/- ~5, forwardRef)
M src/localization/iLocalization.ts       (+13)
M src/localization/resources/en.ts        (+13)
M src/localization/resources/vi.ts        (+13)
M src/zustand/persist.ts                  (+3 -2, user.phone)
```

### harness

```
A .harness/tasks/T-0033/*                 (task, plan, contract, status, implementation,
                                            files-changed, evaluation, handoff)
M .harness/TASKS.md                       (T-0033 status update)
```

---

## Legend

- `A` - Added file
- `M` - Modified file
- `D` - Deleted file
- `R` - Renamed file

---

## Breaking Changes

- `authService.login/register` (mock email/password) bị thay bằng `requestOtp/verifyOtp`.
  Mock cũ chưa dùng production → chấp nhận breaking. Không consumer nào ngoài SigninStack dùng.

---

## Backward Compatibility

✅ Không ảnh hưởng backend/Prisma. `SignupScreen.tsx` giữ nguyên file (chỉ gỡ khỏi navigation).
