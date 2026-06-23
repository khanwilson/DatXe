# T-0014: Mobile API client app_user

**Title**: Mobile API client app_user  
**Priority**: P1  
**Projects**: app_user

## Requirement
Xây dựng API client (axios): base URL + timeout từ config, request interceptor (attach token), response interceptor (parse error, auto-refresh 401), Zustand auth store, auth hooks.

## Files
- `app_user/src/api/client.ts` (create)
- `app_user/src/api/auth.ts` (create)
- `app_user/src/api/hooks.ts` (create)
- `app_user/src/api/error-handler.ts` (create)
- `app_user/src/zustand/auth-store.ts` (create)

## API Functions
- login(email, password) -> tokens + user
- register(data) -> tokens + user
- refreshToken(token) -> new tokens
- logout() -> clear tokens, secure store

## Success Criteria
- [ ] Axios instance với interceptors
- [ ] Auth API functions (login, register, refresh, logout)
- [ ] Token lưu trong SecureStore
- [ ] Auto-refresh khi 401
- [ ] Error handler: network, timeout, auth
- [ ] Zustand auth store + hooks

## Dependencies
- T-0012 (env config)
- T-0006 (Backend auth APIs)
