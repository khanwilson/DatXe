# Files Changed

**Task ID**: T-0050
**Date**: 2026-07-01

---

## Summary

Total files changed: 8 (2 added, 6 modified)

---

## By Project

### nestjs_prisma

```
A api/config/goong.config.ts
A api/modules/routes/services/goong.service.ts
M api/modules/routes/routes.service.ts
M api/modules/routes/services/route-cache.service.ts
M api/modules/routes/routes.module.ts
M api/common/config/env.validation.ts
M .env.example
M .env
```

### app_taixe / app_user

```
(none — out of scope)
```

### .harness

```
M TASKS.md          (T-0050 status → Done)
M PROJECT_STATE.md  (routing provider = Goong; env vars)
M DECISIONS.md      (new decision: Goong backend provider)
A tasks/T-0050/*    (plan, contract, status, evaluation, implementation, files-changed, decisions, handoff)
```

---

## Legend

- `A` - Added file
- `M` - Modified file
- `D` - Deleted file
- `R` - Renamed file

---

## Breaking Changes

None. `/routes/*` request/response contract unchanged.

One behavioral change: `mode: "transit"` now returns **400 Bad Request** (Goong has no transit mode). Previously Google accepted transit. No known caller uses transit.

---

## Backward Compatibility

✅ API-compatible. Google Maps files (`google-maps.config.ts`, `google-maps.service.ts`) left in place — removal deferred to T-0056.

⚠️ Cache: key prefixes bumped to `goong:*`, so any pre-existing Google-shaped cache entries are orphaned (never served). No action needed; they expire by TTL.
