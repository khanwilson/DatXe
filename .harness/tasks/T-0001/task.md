# T-0001: Backend env config mở rộng

**Title**: Backend env config mở rộng  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Mở rộng `.env.example` backend với các biến cho booking flow: Redis, JWT refresh token, PostGIS, API prefix, CORS, rate limit.

## Files
- `nestjs_prisma/.env.example` (update)
- `nestjs_prisma/api/common/config/env.validation.ts` (create)
- `nestjs_prisma/docker-compose.yml` (update - thêm PostGIS)

## API Changes
None (chỉ config)

## Success Criteria
- [ ] Env vars cho Redis, JWT refresh, PostGIS có mặt
- [ ] Validation throw error nếu thiếu DATABASE_URL
- [ ] Docker compose có postgres:16 với PostGIS
- [ ] Không hardcode secret

## Dependencies
None
