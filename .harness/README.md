# Harness — Task Workflow

Hệ thống quản lý task tự động: từ mô tả công việc → plan → code → test → review → done.

## Cách dùng

```bash
/harness <mô tả task>       # tạo task mới
/harness T-XXXX             # resume task đang dở
/harness approve            # duyệt plan để chạy tiếp
```

## Flow

```
Created → Planning → [DUYỆT PLAN] → Contracting → Implementing → Evaluating → Reviewing → Closing → Done
```

**Chỉ có 1 chỗ bắt buộc dừng**: sau khi Planner tạo `plan.md`. Duyệt plan xong, mọi phase sau chạy tự động cho đến khi done hoặc gặp blocker.

## Các Phase

| Phase             | Agent                 | Model   | Output                                                              |
|-------------------|-----------------------|---------|---------------------------------------------------------------------|
| **Planning**      | `harness-planner`     | Sonnet  | `plan.md` — phân tích task, đề xuất cách làm                        |
| **Contracting**   | `harness-contractor`  | Sonnet  | `contract.md` — scope, allowed files, acceptance criteria           |
| **Implementing**  | `harness-implementer` | Opus    | Code + `implementation.md`, `files-changed.md`                      |
| **Evaluating**    | `harness-evaluator`   | Sonnet  | `evaluation.md` — lint/typecheck/test/build + contract compliance   |
| **Reviewing**     | `harness-reviewer`    | Sonnet  | `review.md` — quality, regression risk, edge cases                  |
| **Closing**       | `harness-closer`      | Haiku   | `handoff.md` — summary, decisions, lessons learned                  |
| **Architect**     | `harness-architect`   | Opus    | Gọi khi cần — boundary decisions, cross-module, high-risk           |

## Fixing Loop

Nếu Evaluating hoặc Reviewing fail và fix được trong Allowed Files:

```
Evaluating FAIL → Implementing (fix) → Evaluating (lại) → Reviewing
```

Loop tự động, không cần duyệt. Dừng khi: fail ngoài scope, root cause không rõ, hoặc cần kiến trúc.

## Cấu trúc thư mục task

```
.harness/tasks/T-XXXX/
├── description.md      # mô tả task
├── plan.md             # kế hoạch implement
├── contract.md         # scope + allowed files + acceptance criteria
├── implementation.md   # những gì đã code
├── files-changed.md    # danh sách file đã sửa
├── decisions.md        # quyết định kỹ thuật trong quá trình làm
├── evaluation.md       # kết quả lint/test/build
├── review.md           # review chất lượng
├── handoff.md          # tổng kết + lessons learned
└── status.md           # trạng thái hiện tại
```

## Blocker

Khi gặp vấn đề cần quyết định, Harness dừng và hiện:

```
## Blocker
Phase: Implementing
Reason: Cần sửa file ngoài Allowed Files
Decision Needed: Có cho phép sửa app_user/src/config.ts không?
Options:
  1. Cho phép — vì cần share constant
  2. Không — tìm cách khác trong scope
```

Trả lời xong, Harness tự chạy tiếp từ phase bị chặn.

## Quy tắc quan trọng

- **Không code trước plan + contract** — bắt buộc duyệt plan trước
- **Không sửa ngoài Allowed Files** — muốn sửa phải hỏi trước
- **Không sửa project không liên quan** — task app_taixe không đụng app_user
- **Không push git** — tất cả changes local, dev review rồi push sau

## Architect

Không phải phase cố định. Gọi khi:
- Thay đổi API contract, database schema, module boundary
- Cross-project impact
- Auth/payment/security risk
- Nhiều cách làm, chọn sai sẽ tốn công lớn

## Environment

Đảm bảo **không** set `CLAUDE_CODE_SUBAGENT_MODEL` về 1 model cố định. Model routing do `.claude/agents/*.md` frontmatter quyết định.
