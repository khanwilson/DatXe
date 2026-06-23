# T-0016: Login Register UI app_user

**Title**: Login Register UI app_user  
**Priority**: P1  
**Projects**: app_user

## Requirement
Màn hình Login và Register cho app_user. Dùng API client từ T-0014. Navigation: onboarding -> login/register -> home. Xử lý loading, error, validate input, lưu session.

## Files
- `app_user/app/SigninStack/SignInScreen.tsx` (update)
- `app_user/app/SigninStack/SignUpScreen.tsx` (create)
- `app_user/app/(tabs)/` (update - redirect nếu chưa login)
- `app_user/app/_layout.tsx` (update - auth state check)

## Flow
1. Open app -> check token -> home hoặc login
2. Đăng ký (customer) -> login -> home
3. Đăng nhập -> lưu token -> home
4. Logout -> clear token -> login

## Success Criteria
- [ ] Màn hình login hoạt động (email + password)
- [ ] Màn hình register (email + password + full name)
- [ ] Validate input (email format, password min 6)
- [ ] Loading state khi gọi API
- [ ] Error display (sai email/password)
- [ ] Lưu token, auto-login
- [ ] Navigation guard (redirect nếu chưa login)

## Dependencies
- T-0014 (API client + auth store)
- T-0006 (Backend auth API)
