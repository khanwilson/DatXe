# Plan - T-0001

**Task ID**: T-0001  
**Phase**: Planning  
**Created**: 2026-06-23  

---

## Analysis

### Scope Clarification

- **Affected Projects**: nestjs_prisma
- **Affected Files**:
  - `nestjs_prisma/.env.example` (update)
  - `nestjs_prisma/src/common/config/env.validation.ts` (create)
  - `nestjs_prisma/docker-compose.yml` (update)
  - `nestjs_prisma/src/main.ts` (update - thêm env validation)
- **Estimated Complexity**: Low

### Dependencies

- **Previous Tasks**: None (Wave 1 foundation task)
- **External Dependencies**: None
- **Blocked By**: None

### Risks

1. **Risk**: Env validation quá strict có thể gây lỗi khi thiếu optional vars  
   **Mitigation**: Chỉ validate required vars, optional vars có default value

2. **Risk**: PostGIS extension không có sẵn trong postgres image  
   **Mitigation**: Dùng `postgis/postgis:16-3.4` image

3. **Risk**: Rate limit config không rõ ràng  
   **Mitigation**: Dùng sensible defaults (100 requests/minute)

---

## Implementation Approach

### Step 1: Update `.env.example`
Mở rộng với các nhóm env vars: Database, Redis, JWT, API, CORS, Rate Limit.

### Step 2: Create env validation
Tạo `src/common/config/env.validation.ts` validate required vars, parse numeric vars, set defaults.

### Step 3: Update docker-compose.yml
Dùng `postgis/postgis:16-3.4` thay `postgres:16`, add Redis service.

### Step 4: Update main.ts
Thêm env validation call khi app bootstrap.

---

## Testing Strategy

- **Manual**: Chạy app với env đầy đủ → start OK; thiếu DATABASE_URL → throw error
- **Docker**: `docker-compose up` → PostGIS + Redis chạy được
- **Type check**: `npm run build` → không type error

---

## Estimated Effort

- Planning: 15 min
- Implementation: 30 min
- Testing: 15 min
- Total: ~1 hour

---

## Acceptance Criteria

- [ ] `.env.example` có đầy đủ env vars (Redis, JWT, PostGIS, API prefix, CORS, rate limit)
- [ ] `env.validation.ts` validate required vars, có default cho optional vars
- [ ] `docker-compose.yml` dùng PostGIS image, có Redis service
- [ ] `main.ts` gọi env validation khi start
- [ ] App start OK với env đầy đủ
- [ ] App throw error khi thiếu DATABASE_URL
- [ ] Không hardcode secret trong source code
