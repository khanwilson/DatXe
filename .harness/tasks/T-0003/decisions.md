# Decisions (Task-Scoped)

**Task ID**: T-0003  
**Date**: 2026-06-23  

---

## Task-Scoped Decisions

### D-T-0003-1: Package Manager — bun thay vì npm

| Field | Value |
|-------|-------|
| **Context** | Lệnh install ban đầu chạy bằng npm, nhưng project convention là bun (có bun.lock) |
| **Options Considered** | <ul><li>npm (default — gây conflict với bun.lock)</li><li>bun (project convention)</li></ul> |
| **Decision** | Dùng bun cho tất cả operations |
| **Rationale** | Project đã có bun.lock, dependencies quản lý bằng bun. Trộn npm + bun gây conflict và install nhầm vào parent directory. |
| **Impact** | Tất cả task sau phải dùng `bun add`, `bun run build`, `bun run lint` |

---

## Decisions to Promote

### Candidates for Promotion

- [x] **D-T-0003-1 (bun package manager)** → Ảnh hưởng tất cả task sau. Đã promote vào DECISIONS.md.
