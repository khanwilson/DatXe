# Implementation Decisions: T-0074

## Decisions Made

1. **Redis Service Path Correction**: Fixed the import path for RedisService in `auth.service.ts` from `../../common/redis/redis.service` to `../common/redis/redis.service` to resolve TypeScript compilation error.

2. **Swagger Decorator Import**: Added missing `ApiBearerAuth` import in `auth.controller.ts` to resolve compilation error.

3. **Zustand Import Pattern**: Used consistent import pattern `import ZustandPersist from 'zustand/persist'` in both app_user and app_taixe index files to match existing codebase patterns.

4. **Separate Axios Instance for Refresh**: Implemented refresh token calls using a separate Axios instance in both app interceptors to prevent infinite loops, matching the existing pattern in app_user.

5. **Concurrent Refresh Handling**: Implemented module-level `isRefreshing` flag and `failedQueue` array in both app interceptors to properly handle concurrent refresh requests, preventing multiple simultaneous refresh calls.

6. **Error Handling Consistency**: Maintained consistent error handling approach across both applications, ensuring that failed refresh attempts properly log out the user and reject queued requests.