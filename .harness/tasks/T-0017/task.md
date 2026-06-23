# T-0017: Login Register UI app_taixe

**Title**: Login Register UI app_taixe  
**Priority**: P1  
**Projects**: app_taixe

## Requirement
Màn hình Login và Register cho app_taixe. Dùng API client từ T-0015. Flow: onboarding -> login/register -> home (driver). Validation, loading, error handling.

## Files
- `app_taixe/app/SigninStack/SignInScreen.tsx` (update)
- `app_taixe/app/SigninStack/SignUpScreen.tsx` (create)
- `app_taixe/app/(tabs)/` (update - auth guard)
- `app_taixe/app/_layout.tsx` (update)

## Success Criteria
- [ ] Login màn hình (email + password)
- [ ] Register (email + password + full name + license)
- [ ] Validate input
- [ ] Loading + error states
- [ ] Auto-login từ stored token
- [ ] Navigation guard

## Dependencies
- T-0015 (API client)
- T-0006 (Backend auth)
