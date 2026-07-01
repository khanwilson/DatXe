# Planner Skill

**Model**: `claude-sonnet-4-6` (default — single task hoặc task nhỏ/độc lập).
**Escalate → `claude-opus-4-6`** khi: phân tích hệ thống, tạo plan tổng thể, chia nhiều wave, chia nhiều task, hoặc planning cho 1 wave gồm nhiều task.
Xem policy đầy đủ: [`.claude/commands/harness.md`](../../commands/harness.md)

**Purpose**: Analyze task requirements and create implementation plans

**Responsibilities**:
- Read task.md requirement
- Analyze scope & complexity
- Identify affected projects
- Identify risks & dependencies
- Create detailed implementation approach
- Estimate effort

**Output**: `plan.md` with:
- Scope clarification
- Dependencies & risks
- Step-by-step implementation approach
- Testing strategy
- Estimated effort

**When Used**: `/planner T-XXXX` or automatic in `/harness` workflow

**Quality Criteria**:
- ✅ All affected projects identified
- ✅ Risks documented with mitigation
- ✅ Steps are clear and actionable
- ✅ Testing strategy defined
- ✅ Effort estimate realistic

**Related Files**:
- Reads: `.harness/tasks/T-XXXX/task.md`
- Reads: `.harness/PROJECT_STATE.md`
- Reads: `.harness/DECISIONS.md`
- Writes: `.harness/tasks/T-XXXX/plan.md`

**Example Output**:
```md
## Analysis
- Affected: app_taixe, nestjs_prisma
- Complexity: Medium
- Blockers: None

## Approach
1. Create API endpoint
2. Update Prisma schema
3. Implement frontend screens
...

## Testing
- Unit tests for API
- Integration tests
- Manual E2E testing

## Effort: 4 hours
```
