# Contract - T-0001

**Task ID**: T-0001  
**Phase**: Contracting  
**Created**: 2026-06-23  

---

## Scope

### In Scope

1. **Mở rộng `.env.example`** với các biến môi trường mới:
   - Redis connection (host, port, password, db)
   - JWT refresh token (secret, expiration)
   - API prefix configuration
   - CORS configuration (origins, credentials)
   - Rate limiting (max requests, window)

2. **Tạo env validation** (`api/common/config/env.validation.ts`):
   - Validate required vars khi app start
   - Parse numeric vars
   - Set default values cho optional vars
   - Throw error nếu thiếu required vars

3. **Update `docker-compose.yml`**:
   - Đổi từ `postgres:16` sang `postgis/postgis:16-3.4`
   - Thêm Redis service
   - Update env vars

4. **Update `api/main.ts`**:
   - Thêm env validation khi bootstrap

### Out of Scope

- ❌ Sửa auth module (auth.controller.ts, auth.service.ts, etc.)
- ❌ Sửa Prisma schema
- ❌ Thêm features mới (booking, dispatch, etc.)
- ❌ Cài đặt NestJS Redis module (T-0003)
- ❌ Cài đặt JWT refresh token logic (T-0006)
- ❌ Setup rate limiting middleware
- ❌ Update tests

---

## Allowed Files

```
nestjs_prisma/.env.example
nestjs_prisma/docker-compose.yml
nestjs_prisma/api/main.ts
nestjs_prisma/api/common/config/env.validation.ts (create)
```

---

## Impacted Projects

- [ ] app_taixe
- [ ] app_user
- [x] nestjs_prisma
- [ ] docs
- [ ] harness

---

## Acceptance Criteria

- [ ] `.env.example` có đầy đủ env vars (Redis, JWT refresh, API prefix, CORS, rate limit)
- [ ] `env.validation.ts` sử dụng `class-validator` và `class-transformer`
- [ ] Validation throw error khi thiếu `DATABASE_URL`
- [ ] Validation throw error khi thiếu `JWT_ACCESS_TOKEN_SECRET` và `JWT_REFRESH_TOKEN_SECRET`
- [ ] Validation có default values cho optional vars
- [ ] `docker-compose.yml` sử dụng `postgis/postgis:16-3.4`
- [ ] `docker-compose.yml` có Redis service
- [ ] `main.ts` gọi env validation trước khi app start
- [ ] App build thành công: `npm run build`
- [ ] Không hardcode secrets trong source code

---

## API Contract Changes

None - chỉ config changes.

---

## Database Impact

### Prisma Schema Changes

None

### Migrations Required

- [ ] No migrations needed

---

## Test Strategy

- **Manual**: Chạy app với env đầy đủ → start OK; thiếu DATABASE_URL → throw error
- **Build**: `npm run build` → không type error

---

## Sign-off

- **Planner**: Claude  
- **Code Owner**: User  
- **Approved**: [ ] Yes / [ ] No  
- **Approved At**: 2026-06-23
