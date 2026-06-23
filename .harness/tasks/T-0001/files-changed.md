# Files Changed - T-0001

**Task ID**: T-0001  
**Date**: 2026-06-23  

---

## Summary

Total files changed: 5  
Lines added: ~180  
Lines removed: ~15  

---

## By Project

### app_taixe

Không thay đổi.

### app_user

Không thay đổi.

### nestjs_prisma

```
M .env.example            (+39 -4)  - Mở rộng env vars
M .env                    (+23 -4)  - Sync với .env.example
M docker-compose.yml      (+22 -8)  - PostGIS + Redis + container names
M api/main.ts             (+12 -3)  - Env validation + config usage
A api/common/config/env.validation.ts (+83 -0) - Env validation class
```

### .harness

```
M .harness/tasks/T-0001/task.md       (+0 -0)  - Không thay đổi
M .harness/tasks/T-0001/plan.md       (+68 -35) - Plan detail
M .harness/tasks/T-0001/contract.md   (+91 -61) - Contract detail
M .harness/tasks/T-0001/status.md     (+10 -10) - Status update
M .harness/tasks/T-0001/evaluation.md (+156 -61) - Evaluation report
M .harness/tasks/T-0001/implementation.md (+68 -35) - Implementation detail
M .harness/tasks/T-0001/files-changed.md (+57 -22) - This file
M .harness/tasks/T-0001/handoff.md    (+68 -35) - Handoff detail
M .harness/tasks/T-0001/decisions.md  (+15 -10) - Decision log
```

---

## Legend

- `A` - Added file
- `M` - Modified file
- `D` - Deleted file
- `R` - Renamed file

---

## Breaking Changes

**API Prefix**: Thay đổi từ `/api` → `/api/v1`. Có thể ảnh hưởng:
- Mobile app API calls (sẽ fix trong T-0014/T-0015)
- Swagger docs path (đã update trong main.ts)

---

## Backward Compatibility

✅ `JWT_SECRET` giữ lại để auth module cũ không break
✅ Auth module có thể dùng JWT_SECRET hoặc JWT_ACCESS_TOKEN_SECRET
