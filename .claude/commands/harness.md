# Harness

Full task workflow from creation to completion.

File này là nguồn chân lý duy nhất (**single source of truth**) cho quy trình, rule, checkpoint, contract enforcement, auto-execution behavior, và model routing của harness task.

---

## Core Rule

Harness chỉ có **1 điểm dừng bắt buộc**:

> Sau khi tạo xong `plan.md`, harness phải dừng để user review và approve plan.

Sau khi user approve `plan.md`, harness phải tự động chạy toàn bộ các phase còn lại đến khi:

- Task thành công.
- Gặp blocker thật sự.
- Gặp lỗi quá phức tạp.
- Cần user quyết định scope/product/credential/secret.
- Cần sửa file ngoài `Allowed Files`.
- Một bước bị treo hoặc chờ quá lâu.

Harness **KHÔNG** được dừng giữa các phase chỉ để hỏi confirm kiểu:

```txt
Tiếp tục T-052 — Phase 5: Review?
Continue to next phase?
Proceed to Closing?
```

Nếu phải hỏi user trong quá trình chạy, sau khi user trả lời xong, harness phải tự động tiếp tục từ phase đang dở.

---

## Pipeline

Pipeline chính:

```txt
Planning → Contracting → Implementing → Evaluating → Reviewing → Closing
```

Architect không nằm trong pipeline chính.

Architect được gọi **on-demand** khi task chạm architecture boundary, cần technical direction, hoặc cần xử lý rủi ro kiến trúc.

---

## Task State Workflow

```txt
1. Created
   → Initialize task folder
   ↓
2. Planning
   → Create implementation plan
   ↓
   [BLOCKING GATE]
   → Wait for user approval of plan.md
   ↓
3. Contracting
   → Define scope, Allowed Files, acceptance criteria
   ↓
4. Implementing
   → Implement per contract
   ↓
5. Evaluating
   → Run quality checks
   ↓
   PASS?
   ├─ YES → 6. Reviewing
   └─ NO  → 5.1 Fixing
             → Resolve issues within contract
             → Re-evaluate
   ↓
6. Reviewing
   → Review quality, regression risk, contract compliance, edge cases
   ↓
7. Closing
   → Finalize, create handoff, update state
   ↓
8. Done
   → Task complete
```

---

## Execution Mode

Harness chạy theo cơ chế:

```txt
Plan Approval Gate → Auto-Continue Execution
```

### Before Plan Approval

Harness được phép chạy:

```txt
Created → Planning → plan.md
```

Sau khi tạo `plan.md`, harness phải dừng lại và yêu cầu user review/approve.

### After Plan Approval

Sau khi user approve `plan.md`, harness tự động chạy:

```txt
Contracting → Implementing → Evaluating → Fixing if needed → Reviewing → Closing → Done
```

Không hỏi confirmation giữa các phase.

Không hỏi:

```txt
Tiếp tục phase tiếp theo?
Proceed to Review?
Proceed to Closing?
Continue T-052?
```

Chỉ thông báo trạng thái và tiếp tục chạy.

Ví dụ đúng:

```txt
Plan approved. Continuing to Contracting.
Contracting complete. Continuing to Implementing.
Evaluation passed. Continuing to Review.
Review complete. Continuing to Closing.
```

Ví dụ sai:

```txt
Tiếp tục T-052 — Phase 5: Review?
```

---

## When Harness May Stop

Sau khi `plan.md` đã được approve, harness chỉ được dừng khi có blocker thật sự.

### Được dừng khi

- Cần sửa file ngoài `Allowed Files`.
- Cần thay đổi scope hoặc contract.
- Cần user quyết định product/business logic.
- Cần credential, secret, API key, account access, billing access.
- Cần thao tác bên ngoài máy hoặc bên ngoài repo.
- Gặp lỗi phức tạp, root cause không rõ.
- Implementation fail nhiều lần.
- Test/build/evaluation fail nhưng không thể fix an toàn trong contract hiện tại.
- Có rủi ro cao: data loss, migration, auth, payment, billing, security, native signing, release.
- Một command chạy quá lâu, bị treo, hoặc cần user can thiệp.

### Không được dừng khi

- Chỉ chuyển từ Contracting sang Implementing.
- Chỉ chuyển từ Implementing sang Evaluating.
- Chỉ chuyển từ Evaluating sang Reviewing.
- Chỉ chuyển từ Reviewing sang Closing.
- Chỉ update `handoff.md`, `status.md`, hoặc task metadata.
- Chỉ chạy lint/typecheck/test/build theo contract.
- Chỉ fix lỗi rõ nguyên nhân và nằm trong `Allowed Files`.
- Chỉ cần tạo summary/checklist/log.

---

## User Interaction Policy

Harness phải hạn chế hỏi user trong quá trình chạy.

### Được hỏi user khi

- Cần approve `plan.md`.
- Cần mở rộng `Allowed Files`.
- Cần thay đổi scope hoặc contract.
- Cần credential, secret, API key, account access.
- Cần quyết định product/business.
- Có lỗi phức tạp hoặc fail lặp lại.
- Root cause không rõ.
- Có thao tác nguy hiểm hoặc irreversible.
- Có rủi ro cao liên quan data, billing, payment, security, signing, release.

### Không được hỏi user khi

- Chỉ chuyển phase tiếp theo.
- Chỉ chạy review sau evaluation.
- Chỉ chạy closing sau review.
- Chỉ update handoff/status.
- Chỉ cần chạy lint/typecheck/test/build.
- Chỉ cần fix lỗi rõ nguyên nhân nằm trong contract.
- Chỉ cần format, summarize, hoặc update metadata.

### Resume Rule

Nếu harness phải hỏi user giữa chừng, sau khi user trả lời:

1. Ghi nhận câu trả lời.
2. Update artifact liên quan nếu cần.
3. Tiếp tục ngay từ phase đang dở.
4. Không restart task nếu không cần.
5. Không hỏi lại confirmation để tiếp tục.
6. Chỉ dừng tiếp nếu gặp blocker mới.

Ví dụ đúng:

```txt
Đã rõ. Updating contract.md rồi tiếp tục Implementing.
```

Ví dụ sai:

```txt
Bạn có muốn tiếp tục Phase 4 không?
```

---

## Model IDs

| Alias  | Model ID                    |
|--------|-----------------------------|
| Opus   | `claude-opus-4-6`           |
| Sonnet | `claude-sonnet-4-6`         |
| Haiku  | `claude-haiku-4-5-20251001` |

---

## Model Routing theo Phase

| Phase / Skill                  | Default model                  | Escalate → `claude-opus-4-6` khi |
|--------------------------------|--------------------------------|----------------------------------|
| **Planning** / `planner`       | `claude-sonnet-4-6`            | Phân tích hệ thống, plan tổng thể, chia nhiều wave, chia nhiều task, hoặc planning cho 1 wave gồm nhiều task |
| **Architect**                  | `claude-opus-4-6`              | Luôn Opus khi được gọi — kiến trúc, boundary, module interaction, risk, trade-off, technical direction |
| **Contracting** / `contractor` | `claude-sonnet-4-6`            | Không |
| **Implementing** / `implementer` | `claude-opus-4-6`            | Luôn Opus — chỉ triển khai đúng contract, không tự mở rộng scope |
| **Evaluating** / `evaluator`   | `claude-sonnet-4-6`            | Không |
| **Reviewing** / `reviewer`     | `claude-sonnet-4-6`            | Không |
| **Closing**                    | `claude-haiku-4-5-20251001`    | Không |

---

## Architect Invocation Policy

Architect không phải phase bắt buộc.

Architect là escalation role được gọi bởi Planner, Contractor, Implementer, Evaluator, hoặc Reviewer khi cần quyết định kiến trúc.

Khi Architect được gọi, luôn dùng:

```txt
claude-opus-4-6
```

### Gọi Architect trong Planning khi

- Task cần chia thành nhiều wave.
- Task cần chia thành nhiều task.
- Task ảnh hưởng nhiều module/project.
- Task thay đổi architecture boundary.
- Task thay đổi module interaction.
- Task thay đổi shared convention hoặc cross-project contract.
- Task có nhiều trade-off kỹ thuật.
- Planner không thể chọn hướng triển khai an toàn nếu không phân tích kiến trúc.

### Gọi Architect trong Contracting khi

- Không xác định được `Allowed Files` an toàn.
- Scope boundary chưa rõ.
- Contract có nguy cơ bó sai kiến trúc.
- Cần quyết định module/layer nào được chạm.
- Có nhiều implementation strategy và chọn sai sẽ gây rework lớn.

### Gọi Architect trong Implementing/Fixing khi

- Implementation fail nhiều lần.
- Lỗi không rõ root cause.
- Cần sửa ngoài `Allowed Files`.
- Cần thay đổi contract.
- Cần thay đổi data flow/API/schema/module boundary.
- Implementer phát hiện contract không đủ hoặc không đúng.

### Gọi Architect trong Evaluating/Reviewing khi

- Test/build failure gợi ý lỗi kiến trúc.
- Reviewer phát hiện high-risk issue.
- Có regression risk ở boundary giữa modules.
- Có vấn đề với auth, payment, billing, security, database migration, native signing, release.

### Không gọi Architect khi

- Sửa UI nhỏ.
- Sửa text/copy.
- Fix bug rõ nguyên nhân.
- Thêm validation đơn giản.
- Refactor cơ học trong phạm vi nhỏ.
- Viết test nhỏ.
- Update metadata/status/handoff.
- Task chỉ chạm 1 module với scope rõ ràng.

---

## Escalation Rules

### Escalate lên Opus khi

- Task chạm **architecture boundary**:
  - module interaction
  - cross-project contract
  - shared convention
  - API boundary
  - data flow
  - database schema
- Planner cần:
  - phân tích hệ thống
  - master plan
  - chia nhiều wave
  - chia nhiều task
  - planning cho 1 wave gồm nhiều task

Khi escalate, phải ghi rõ lý do trong artifact tương ứng:

- `plan.md`
- `contract.md`
- `evaluation.md`
- `review.md`
- review notes
- handoff nếu cần

---

## Implementer Rules

Implementer dùng:

```txt
claude-opus-4-6
```

Implementer chỉ triển khai đúng contract.

Implementer không được tự mở rộng scope.

Implementer không được sửa file ngoài `Allowed Files`.

Nếu cần sửa ngoài `Allowed Files`, phải dừng và hỏi user theo Contract Enforcement.

### Khi implementation fail

Nếu implementation fail nhiều lần hoặc gặp lỗi không rõ nguyên nhân:

- Không tự đoán quá nhiều.
- Không mở rộng scope tùy tiện.
- Không sửa lan man ngoài contract.
- Escalate về Planner / Architect / Reviewer để re-plan hoặc điều chỉnh contract.
- Nếu chạm architecture boundary, Architect phải dùng Opus.

---

## Dùng Haiku khi

Chỉ dùng Haiku cho thao tác nhẹ, không cần quyết định kỹ thuật quan trọng:

- Tóm tắt log.
- Tạo closing summary.
- Format checklist.
- Extract files changed.
- Phân loại output đơn giản.
- Cập nhật `status.md`.
- Cập nhật task metadata thuần túy.
- Viết summary/handoff đơn giản.

Không dùng Haiku để:

- Quyết định architecture.
- Review high-risk changes.
- Debug lỗi phức tạp.
- Sửa implementation chính.
- Đổi contract.
- Đánh giá rủi ro release/security/payment/billing.

---

## Contract Enforcement

Task sẽ **KHÔNG** sửa files ngoài `Allowed Files`.

Nếu cần touch file ngoài contract:

1. Dừng phase hiện tại.
2. Hỏi user đúng file nào cần thêm và lý do.
3. Chờ user approve hoặc reject.
4. Nếu user approve:
   - Update `contract.md`.
   - Ghi lý do mở rộng scope.
   - Tiếp tục phase đang dở.
5. Nếu user reject:
   - Tìm hướng khác trong `Allowed Files`.
   - Nếu không có hướng an toàn, dừng với blocker rõ ràng.

Sau khi user approve mở rộng `Allowed Files`, harness phải tự động tiếp tục.

Không hỏi thêm:

```txt
Tiếp tục phase tiếp theo?
Proceed to Review?
Proceed to Closing?
```

Trừ khi có blocker mới.

---

## Checkpoints

Harness có 2 loại checkpoint:

1. Blocking checkpoint.
2. Non-blocking checkpoint.

---

### Blocking Checkpoint

#### After Planning

Sau khi tạo `plan.md`, harness phải dừng để user review và approve.

Harness chỉ tiếp tục khi user approve plan.

User approval có thể là các câu như:

```txt
ok
duyệt
approve
chạy tiếp
làm đi
tiếp tục
plan ổn
```

Sau khi được approve, harness chuyển sang auto-continue mode.

---

### Non-blocking Checkpoints

Các checkpoint sau chỉ dùng để ghi artifact và tự kiểm tra nội bộ.

Harness **không được dừng để hỏi user confirm** ở các checkpoint này:

- ✅ **After Contracting**
  - Tạo và tự review `contract.md`.
- ✅ **After Implementing**
  - Review implementation nội bộ.
- ✅ **After Evaluation**
  - Review test results nội bộ.
- ✅ **After Review**
  - Review reviewer findings & risk assessment nội bộ.
- ✅ **After Closing**
  - Tạo `handoff.md`, update state, mark Done.

Harness chỉ hỏi user ở non-blocking checkpoint nếu có blocker thật sự:

- Cần sửa file ngoài `Allowed Files`.
- Cần thay đổi scope/contract.
- Cần quyết định technical/product mà harness không thể tự quyết.
- Có lỗi quá phức tạp hoặc fail lặp lại.
- Có thao tác nguy hiểm hoặc irreversible.
- Có credential/secret/account access requirement.

---

## Evaluation and Fix Loop

Sau Implementing, harness chạy Evaluating.

Evaluator kiểm tra:

- lint
- typecheck
- test
- build
- contract compliance
- acceptance criteria
- regression risk cơ bản

Nếu Evaluation PASS:

```txt
Evaluating → Reviewing
```

Nếu Evaluation FAIL nhưng lỗi rõ nguyên nhân và nằm trong `Allowed Files`:

```txt
Evaluating → Fixing → Re-evaluating
```

Fixing không phải phase chính riêng biệt.

Fixing là loop nội bộ giữa Evaluating và Implementing.

### Fixing Rules

Fixing được phép tự chạy nếu:

- Lỗi rõ nguyên nhân.
- Fix nằm trong `Allowed Files`.
- Không cần thay đổi contract.
- Không chạm architecture boundary.
- Không cần user input.

Fixing phải dừng hỏi user nếu:

- Cần sửa ngoài `Allowed Files`.
- Cần thay đổi scope.
- Cần đổi contract.
- Root cause không rõ.
- Fail lặp lại.
- Fix có rủi ro cao.

Sau khi user trả lời blocker trong Fixing, harness tiếp tục loop:

```txt
Fixing → Re-evaluating
```

Không hỏi confirm để tiếp tục.

---

## Reviewing

Reviewer kiểm tra:

- Quality.
- Regression risk.
- Contract compliance.
- Edge cases.
- Unintended scope changes.
- Consistency với `CLAUDE.md`, `PROJECT_STATE.md`, `DECISIONS.md`.
- Có sửa file ngoài contract không.
- Có thiếu test/check không.
- Có rủi ro release/security/payment/billing/native build không.

Nếu Review PASS:

```txt
Reviewing → Closing
```

Nếu Review FAIL nhưng fix rõ ràng và nằm trong contract:

```txt
Reviewing → Fixing → Evaluating → Reviewing
```

Nếu Review phát hiện high-risk issue:

- Dừng với blocker rõ ràng, hoặc
- Gọi Architect nếu chạm architecture boundary.

Không hỏi user kiểu:

```txt
Tiếp tục Closing?
```

Nếu review pass, tự chạy Closing.

---

## Closing

Closing dùng:

```txt
claude-haiku-4-5-20251001
```

Closing tạo hoặc update:

- `handoff.md`
- `status.md`
- task metadata
- relevant project state nếu cần
- summary of changed files
- commands run
- test/build status
- known issues
- next steps

Closing không được mở rộng scope.

Closing không được tự sửa logic chính.

Sau Closing, task chuyển sang:

```txt
Done
```

---

## Required Artifacts

Mỗi task nên có các artifact sau:

```txt
task-folder/
├── plan.md
├── contract.md
├── evaluation.md
├── review.md
├── handoff.md
└── status.md
```

Tùy task có thể thêm:

```txt
architecture.md
fix-notes.md
test-results.md
risk-notes.md
```

---

## Artifact Responsibilities

### `plan.md`

Ghi:

- Task goal.
- Requirements.
- Constraints.
- Proposed approach.
- Phases/subtasks nếu có.
- Risk.
- Whether Architect is required.
- Model/escalation reason nếu dùng Opus.

### `contract.md`

Ghi:

- Scope.
- Out of scope.
- `Allowed Files`.
- Acceptance criteria.
- Required checks.
- Implementation constraints.
- User approvals nếu có.
- Scope expansion nếu có.

### `evaluation.md`

Ghi:

- Commands run.
- Results.
- Pass/fail.
- Errors.
- Root cause nếu fail.
- Fix recommendation.
- Re-evaluation history nếu có.

### `review.md`

Ghi:

- Contract compliance.
- Quality review.
- Regression risk.
- Edge cases.
- Issues found.
- Review decision.
- Whether Architect escalation is needed.

### `handoff.md`

Ghi:

- Summary.
- Files changed.
- Commands run.
- Test/build status.
- Known issues.
- Next steps.
- Final status.

### `status.md`

Ghi:

- Current phase.
- Current state.
- Last action.
- Blocker nếu có.
- Next automatic action.
- Done status.

---

## Usage

```txt
/harness <task-description>
```

---

## Example

```txt
/harness Add driver profile management screen to app_taixe and backend API
```

---

## What It Does

Complete workflow:

1. Creates task folder.
2. Reads:
   - `CLAUDE.md`
   - `PROJECT_STATE.md`
   - `DECISIONS.md`
3. Analyzes task requirements.
4. Creates `plan.md`.
5. Stops for user approval of `plan.md`.
6. After user approves `plan.md`, auto-runs the rest of the workflow:
   - Creates `contract.md` với scope, allowed files, acceptance criteria.
   - Implements theo contract.
   - Runs checks:
     - lint
     - typecheck
     - test
     - build
   - Runs evaluation.
   - Fixes issues if evaluation fails and the issue is within contract.
   - Re-evaluates after fixing.
   - Reviews for quality, regression risk, contract compliance, edge cases.
   - Creates handoff documentation.
   - Updates `PROJECT_STATE.md` if needed.
   - Updates task metadata/status.
   - Closes task.
7. Stops only when task succeeds or a real blocker requires user input.
8. Marks task as Done.

---

## Auto-Continue Behavior

Sau khi `plan.md` được approve, harness phải tự động chạy đến Done hoặc blocker.

### Required behavior

```txt
Plan approved.
Continuing to Contracting.

Contracting complete.
Continuing to Implementing.

Implementing complete.
Continuing to Evaluating.

Evaluation passed.
Continuing to Reviewing.

Review passed.
Continuing to Closing.

Closing complete.
Task Done.
```

### Forbidden behavior

```txt
Tiếp tục T-052 — Phase 5: Review?
Bạn có muốn chạy Closing không?
Proceed to next phase?
Continue?
```

---

## Approval Semantics

Harness coi user đã approve plan nếu user trả lời rõ ràng bằng các câu như:

```txt
ok
oke
duyệt
approve
approved
chạy đi
làm đi
tiếp tục
continue
plan ổn
đồng ý
```

Sau approval, harness không cần hỏi thêm confirmation giữa phase.

Nếu user feedback yêu cầu sửa plan:

- Update `plan.md`.
- Nếu cần, hỏi lại approval cho plan đã sửa.
- Chỉ sau khi plan được approve mới auto-run các phase sau.

---

## Blocker Format

Khi phải dừng vì blocker, harness phải báo rõ:

```md
## Blocker

### Phase
<current phase>

### Reason
<why harness must stop>

### Decision Needed
<exact decision needed from user>

### Options
1. <option A>
2. <option B>
3. <option C>

### Recommended Option
<recommended option and why>

### After User Answers
Harness will continue automatically from <phase>.
```

Không được hỏi chung chung:

```txt
Bạn muốn tiếp tục không?
```

Phải hỏi đúng quyết định cần user đưa ra.

---

## Test nhanh

### Single task

```txt
/harness <small independent task>
```

Expected behavior:

```txt
Created
→ Planning with Sonnet
→ Create plan.md
→ Stop for user approval
→ User approves
→ Contracting with Sonnet
→ Implementing with Opus
→ Evaluating with Sonnet
→ Reviewing with Sonnet
→ Closing with Haiku
→ Done
```

Không escalate nếu không chạm high-risk.

Không hỏi confirm giữa các phase sau khi plan đã được duyệt.

---

### Wave task

```txt
/harness <system plan / multi-task wave>
```

Expected behavior:

```txt
Created
→ Planning escalates to Opus
→ Architect Opus if architecture boundary exists
→ Create plan.md
→ Stop for user approval
→ User approves
→ Contracting
→ Implementing
→ Evaluating
→ Reviewing
→ Closing
→ Done
```

Planner nâng lên Opus khi:

- plan tổng thể
- chia nhiều wave
- chia nhiều task
- planning cho 1 wave gồm nhiều task

Architect Opus nếu cần quyết định boundary.

Các phase còn lại chạy theo default model routing.

---

### Mid-task question

Nếu harness cần hỏi user giữa chừng:

```txt
Cần thêm file X vào Allowed Files vì Y. Approve không?
```

Sau khi user trả lời:

```txt
approve
```

Expected behavior:

```txt
Update contract.md
Continue current phase automatically
```

Không hỏi tiếp:

```txt
Tiếp tục phase này không?
```

---

## Version

**Last Updated**: 2026-07-01  
**Version**: 4.0