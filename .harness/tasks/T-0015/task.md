# T-0015: Mobile API client app_taixe

**Title**: Mobile API client app_taixe  
**Priority**: P1  
**Projects**: app_taixe

## Requirement
Xây dựng API client cho app_taixe (giống T-0014): axios, auth store, login/register hooks, error handling.

## Files
- `app_taixe/src/api/client.ts` (create)
- `app_taixe/src/api/auth.ts` (create)
- `app_taixe/src/api/hooks.ts` (create)
- `app_taixe/src/api/error-handler.ts` (create)
- `app_taixe/src/zustand/auth-store.ts` (create)

## Success Criteria
- [ ] Axios instance với interceptors
- [ ] Auth API functions
- [ ] Token trong SecureStore
- [ ] Auto-refresh khi 401
- [ ] Error handler hoạt động

## Dependencies
- T-0013 (env config)
- T-0006 (Backend auth APIs)
