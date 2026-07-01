# Harness

Full task workflow from creation to completion. File này là nguồn chân lý duy nhất (single source of truth) cho quy trình, rule, và model routing của harness task.

---

## Pipeline

```
Planning → Contracting → Implementing → Evaluating → Reviewing → Closing
```

Architect được gọi khi chạm architecture boundary (không nằm trong pipeline chính, được trigger on-demand).

---

## Model IDs

| Alias  | Model ID                    |
|--------|-----------------------------|
| Opus   | `claude-opus-4-6`           |
| Sonnet | `claude-sonnet-4-6`         |
| Haiku  | `claude-haiku-4-5-20251001` |

---

## Model Routing theo Phase

| Phase / Skill                     | Default model                 | Escalate → `claude-opus-4-6` khi                                                                              |
|-----------------------------------|-------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Planning** (planner)            | `claude-sonnet-4-6`           | Phân tích hệ thống, plan tổng thể, chia nhiều wave, chia nhiều task, hoặc planning cho 1 wave gồm nhiều task  |
| **Architect**                     | `claude-opus-4-6`             | Luôn Opus — kiến trúc, boundary, module interaction, risk, trade-off, technical direction                     |
| **Contracting** (contractor)      | `claude-sonnet-4-6`           | Contract chạm architecture/security/payment/auth/database migration/native build/release                      |
| **Implementing** (implementer)    | `claude-opus-4-6`             | Luôn Opus — chỉ triển khai đúng contract, không tự mở rộng scope                                              |
| **Evaluating** (evaluator)        | `claude-sonnet-4-6`           | — (Haiku chỉ để tóm tắt log; pass/fail + root cause vẫn Sonnet)                                               |
| **Reviewing** (reviewer)          | `claude-sonnet-4-6`           | High-risk: auth, payment, billing, database migration, native signing, release, security, architecture boundary |
| **Closing**                       | `claude-haiku-4-5-20251001`   | Chỉ khi cần viết release note quan trọng                                                                      |
|___________________________________|_______________________________|_______________________________________________________________________________________________________________|

---

## Escalation Rules

### Escalate lên Opus khi

- Task chạm **architecture boundary** (module interaction, cross-project contract, shared convention).
- Planner cần: phân tích hệ thống, master plan, chia nhiều wave, chia nhiều task, hoặc planning cho 1 wave gồm nhiều task.
- Reviewer phát hiện high-risk issue: auth, payment, billing, database migration, native signing, release, security.
- Contract liên quan: architecture, security, payment, auth, database migration, native build, release.

Khi escalate, ghi rõ lý do trong artifact tương ứng (`plan.md` / `contract.md` / `evaluation.md` / review notes).

### Implementer escalation (khi fail)

Nếu implementation fail nhiều lần hoặc gặp lỗi không rõ nguyên nhân:

- **KHÔNG** tự đoán quá nhiều.
- Escalate về **planner / architect / reviewer** (Opus nếu chạm architecture boundary) để re-plan hoặc điều chỉnh contract.

### Dùng Haiku khi

Chỉ cần thao tác nhẹ, không cần quyết định kỹ thuật quan trọng:

- Tóm tắt log.
- Tạo closing summary.
- Format checklist.
- Extract files changed.
- Phân loại output đơn giản.
- Cập nhật `status.md` / task metadata thuần túy.

---

## Usage

```
/harness <task-description>
```

## Example

```
/harness Add driver profile management screen to app_taixe and backend API
```

---

## What It Does

Complete workflow:
1. Creates task folder
2. Reads `CLAUDE.md`, `PROJECT_STATE.md`, `DECISIONS.md`
3. Analyzes task requirements
4. Creates `plan.md`
5. Creates `contract.md` với scope, allowed files, acceptance criteria
6. Implements theo contract
7. Runs checks (lint, typecheck, test, build)
8. Runs evaluation
9. Reviews for quality, regression risk, contract compliance, edge cases
10. Creates handoff documentation
11. Updates `PROJECT_STATE.md`
12. Closes task

---

## Contract Enforcement

Task sẽ **KHÔNG** sửa files ngoài `Allowed Files`.

Nếu cần touch file ngoài contract:
1. Dừng lại và hỏi user
2. Chờ approval trước khi tiếp tục

---

## Checkpoints

- ✅ **After Planning**: Review `plan.md`
- ✅ **After Contracting**: Review `contract.md` scope & allowed files
- ✅ **After Implementing**: Review implementation
- ✅ **After Evaluation**: Review test results
- ✅ **After Review**: Review reviewer findings & risk assessment
- ✅ **After Closing**: Review `handoff.md`

---

## Test nhanh

- **Single task** (nhỏ, độc lập): `/harness <task>` → Planner chạy Sonnet, Contractor + Evaluator + Reviewer đều Sonnet, Implementer Opus, Closing Haiku. Không escalate nếu không chạm high-risk.
- **Wave task** (nhiều task / phân tích hệ thống): Planner nâng lên Opus, Architect Opus quyết định boundary; các phase còn lại theo default.

---

**Last Updated**: 2026-07-01
**Version**: 2.0
