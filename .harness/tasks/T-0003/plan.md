# Plan

**Task ID**: T-0003  
**Phase**: Planning  
**Created**: 2026-06-23  

---

## Analysis

### Scope Clarification

- **Affected Projects**: nestjs_prisma
- **Affected Files**:
  - `nestjs_prisma/api/common/redis/redis.module.ts` (create)
  - `nestjs_prisma/api/common/redis/redis.service.ts` (create)
  - `nestjs_prisma/api/common/redis/cache.service.ts` (create)
  - `nestjs_prisma/api/app.module.ts` (update — import RedisModule)
  - `nestjs_prisma/package.json` (add ioredis dependency)
- **Estimated Complexity**: Medium

### Dependencies

- **Previous Tasks**: T-0001 (env config — REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB already defined)
- **External Dependencies**: ioredis package
- **Blocked By**: None
- **Required For**: T-0004 (WebSocket gateway), T-0031 (Google Maps caching), T-0027 (Redis Geo), T-0030 (Health check)

### Risks

- **Risk 1**: Redis server not available during development → Mitigation: graceful error handling, optional Redis module
- **Risk 2**: Connection leaks on app restart → Mitigation: OnModuleDestroy cleanup
- **Risk 3**: ioredis version incompatibility → Mitigation: pin exact version

---

## Implementation Approach

### Step 1: Install ioredis
```bash
npm install ioredis @types/ioredis
```

### Step 2: Create RedisModule (global)
- `api/common/redis/redis.module.ts` — global module exporting RedisService
- `api/common/redis/redis.service.ts` — wraps ioredis, handles connect/disconnect, error handling
- Implements `OnModuleInit` (connect) and `OnModuleDestroy` (disconnect)
- Uses env vars: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB

### Step 3: Create CacheService
- `api/common/redis/cache.service.ts` — abstraction layer over RedisService
- Methods: `get<T>(key)`, `set(key, value, ttl?)`, `delete(key)`, `has(key)`, `clear()`
- JSON serialization/deserialization for complex values
- TTL in seconds (Redis native)
- Key prefixing to avoid collisions (e.g., `cache:user:123`)

### Step 4: Register in AppModule
- Import RedisModule as global module in `api/app.module.ts`

### Step 5: Verify
- Build passes
- Redis connection works when docker-compose redis container is running
- Graceful degradation when Redis is down (no crash)

---

## Testing Strategy

- **Build Check**: `npm run build` passes
- **Lint Check**: `npm run lint` passes
- **Manual Check**: Start app with Redis running, verify connection log
- **Manual Check**: Stop Redis, verify app still starts (graceful error)
- **Edge Cases**:
  - Redis connection timeout
  - Invalid credentials
  - TTL = 0 or negative
  - JSON serialization errors

---

## Estimated Effort

- Planning: 30 min (done)
- Implementation: 1 hour
- Testing: 15 min
- Total: ~1.5 hours

---

## Acceptance Criteria

- [x] ioredis installed and typed
- [x] RedisModule created as global module
- [x] RedisService handles connect/disconnect/error gracefully
- [x] CacheService: get/set/delete/clear with TTL support
- [x] AppModule imports RedisModule
- [x] No lint errors
- [x] Build passes
- [x] No hard-coded secrets (uses env vars from T-0001)
