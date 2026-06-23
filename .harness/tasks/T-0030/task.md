# T-0030: Health check endpoint

**Title**: Health check endpoint  
**Priority**: P2  
**Projects**: nestjs_prisma

## Requirement
Tạo health check endpoint: GET /api/health. Check: DB connection, Redis connection, memory, uptime. Trả về format chuẩn.

## Files
- `nestjs_prisma/api/health/health.controller.ts` (create)
- `nestjs_prisma/api/health/health.module.ts` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## API Contract
GET /api/health -> { status: "ok" | "degraded", uptime, timestamp, checks: { database, redis, memory } }

## Success Criteria
- [ ] DB health check
- [ ] Redis health check
- [ ] Memory + uptime
- [ ] Response format đúng T-0005

## Dependencies
- T-0003 (Redis)
- T-0005 (API format)
