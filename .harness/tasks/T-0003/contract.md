# Contract

**Task ID**: T-0003  
**Phase**: Contracting  
**Created**: 2026-06-23  

---

## Scope

### In Scope

- Install ioredis package + types
- Create RedisModule (global)
- Create RedisService (ioredis wrapper: connect, disconnect, error handling)
- Create CacheService (get/set/delete/clear with TTL)
- Register RedisModule in AppModule
- Graceful degradation when Redis is unavailable

### Out of Scope

- Redis Geo operations (đó là T-0027)
- Redis Streams (đó là T-0004 WebSocket gateway)
- Rate limiting implementation (sẽ dùng trong T-0006)
- Google Maps caching (đó là T-0031)
- Health check endpoint (đó là T-0030)

---

## Allowed Files

```
nestjs_prisma/api/common/redis/redis.module.ts (create)
nestjs_prisma/api/common/redis/redis.service.ts (create)
nestjs_prisma/api/common/redis/cache.service.ts (create)
nestjs_prisma/api/app.module.ts (update)
nestjs_prisma/package.json (update - add ioredis)
.harness/tasks/T-0003/* (task documentation)
```

**Rationale**: Task chỉ liên quan Redis setup trong backend. Không touch frontend hoặc database schema.

---

## Impacted Projects

- [ ] app_taixe
- [ ] app_user
- [x] nestjs_prisma
- [ ] docs
- [ ] harness

---

## Acceptance Criteria

- [ ] ioredis installed
- [ ] RedisModule exported as global
- [ ] RedisService connects to Redis using env vars (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB)
- [ ] CacheService: get/set/delete/clear với TTL (seconds)
- [ ] Graceful shutdown on app close
- [ ] App does NOT crash when Redis is down
- [ ] No lint errors: `npm run lint`
- [ ] TypeScript compiles: `npm run build`
- [ ] No hard-coded secrets/API keys
- [ ] Follows project conventions
- [ ] All changes within Allowed Files

---

## API Contract Changes

None — internal service only.

---

## Database Impact

None — no Prisma schema changes.

---

## Test Strategy

- **Build Check**: `npm run build` passes
- **Lint Check**: `npm run lint` passes
- **Connection Test**: App starts with Redis running, connection logged
- **Graceful Degradation**: App starts without Redis, logs error but doesn't crash
- **Edge Cases**: TTL=0, invalid JSON values, connection timeout

---

## Sign-off

- **Planner**: Claude Sonnet 4.6
- **Code Owner**: nathan
- **Approved**: Yes
- **Approved At**: 2026-06-23
