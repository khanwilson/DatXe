# Decisions (Task-Scoped) - T-0001

**Task ID**: T-0001  
**Date**: 2026-06-23  

---

## Task-Scoped Decisions

These decisions only affect this task and are not promoted to global `DECISIONS.md`.

### D-T-0001-1: Giữ JWT_SECRET cho backward compatibility

| Field | Value |
|-------|-------|
| **Context** | Auth module cũ sử dụng `JWT_SECRET` và `JWT_EXPIRES_IN`. T-0001 muốn đổi tên thành `JWT_ACCESS_TOKEN_SECRET` và `JWT_ACCESS_TOKEN_EXPIRATION` cho consistency. |
| **Options Considered** | <ul><li>Option 1: Đổi tên ngay, break auth module</li><li>Option 2: Giữ cả 2 tên, auth module dùng JWT_SECRET, config mới dùng JWT_ACCESS_TOKEN_*</li><li>Option 3: Migrate auth module sang tên mới trong T-0001</li></ul> |
| **Decision** | Option 2: Giữ JWT_SECRET để auth module cũ không break. Thêm JWT_ACCESS_TOKEN_SECRET và JWT_REFRESH_TOKEN_SECRET cho config mới. |
| **Rationale** | T-0001 là foundation task, không nên touch auth module. T-0006 sẽ migrate auth module sang refresh token flow. Giữ cả 2 tên variable cho đến khi T-0006 hoàn thành. |
| **Impact** | `.env.example` có cả JWT_SECRET và JWT_ACCESS_TOKEN_SECRET. Validation class chấp nhận cả 2. Auth module tiếp tục hoạt động bình thường. |

### D-T-0001-2: Dùng PostGIS image thay vì cài extension riêng

| Field | Value |
|-------|-------|
| **Context** | PostgreSQL cần PostGIS extension cho geo-spatial queries (dispatch service). |
| **Options Considered** | <ul><li>Option 1: Dùng postgres:16-alpine + cài PostGIS extension trong Dockerfile</li><li>Option 2: Dùng postgis/postgis:16-3.4 image có sẵn</li><li>Option 3: Không dùng PostGIS, chỉ dùng Redis Geo cho location queries</li></ul> |
| **Decision** | Option 2: Dùng postgis/postgis:16-3.4 image |
| **Rationale** | PostGIS image có sẵn extension, không cần setup phức tạp. Image size lớn hơn (~1GB vs ~400MB) nhưng acceptable cho dev environment. Theo OverviewGoal.md section 4.3: "PostgreSQL + PostGIS" là công nghệ chính cho location queries. |
| **Impact** | Docker image size tăng ~600MB. PostGIS functions available trong PostgreSQL (ST_Distance, ST_DWithin, ST_MakePoint, etc.) |

### D-T-0001-3: Không fix Jest config trong T-0001

| Field | Value |
|-------|-------|
| **Context** | Jest config có rootDir="src" nhưng source code ở "api/". Jest tests sẽ fail. |
| **Options Considered** | <ul><li>Option 1: Fix jest config trong T-0001</li><li>Option 2: Bỏ qua, để task khác fix</li></ul> |
| **Decision** | Option 2: Không fix trong T-0001 |
| **Rationale** | Jest config issue là pre-existing bug, không phải do T-0001 gây ra. Fix trong T-0001 sẽ mở rộng scope ngoài contract. Task khác nên handle. |
| **Impact** | Jest tests sẽ fail nếu chạy. Không ảnh hưởng build/lint/typecheck. |

---

## Decisions to Promote

If any decision affects multiple tasks or future work, it will be promoted to global `DECISIONS.md` during closing.

### Candidates for Promotion

- [x] D-T-0001-1: JWT_SECRET backward compatibility - affects T-0006 (auth refresh token migration)
- [ ] D-T-0001-2: PostGIS image choice - affects T-0002 (Prisma schema)
- [ ] D-T-0001-3: Jest config issue - affects T-0029 (Swagger docs) và tất cả test tasks
