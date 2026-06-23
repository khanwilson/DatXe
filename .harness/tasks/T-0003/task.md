# T-0003: Redis connection và cache service

**Title**: Redis connection và cache service  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Setup Redis connection trong NestJS backend. Tạo RedisModule global, CacheService abstraction (get/set/delete với TTL). Rate limiting cơ bản với Redis store.

## Files
- `nestjs_prisma/api/common/redis/redis.module.ts` (create)
- `nestjs_prisma/api/common/redis/redis.service.ts` (create)
- `nestjs_prisma/api/common/redis/cache.service.ts` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## API Changes
None (internal service)

## Success Criteria
- [ ] ioredis kết nối thành công từ env vars
- [ ] CacheService: get/set/delete/clear với TTL
- [ ] Graceful shutdown khi Redis disconnect
- [ ] Error handling (Redis down không crash app)

## Dependencies
- T-0001 (env REDIS_HOST, REDIS_PORT)
