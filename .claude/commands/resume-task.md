# Resume Task

Resume work on an existing task from its current phase.

**Model** (nguồn chân lý: [`.claude/commands/harness.md`](harness.md)) — theo phase:
- Planning → `claude-sonnet-4-6` (escalate `claude-opus-4-6` nếu system-level/multi-wave/multi-task)
- Contracting → `claude-sonnet-4-6` (escalate Opus nếu architecture/security/payment/auth/DB migration/native/release)
- Implementing → `claude-opus-4-6`
- Evaluating → `claude-sonnet-4-6`
- Reviewing → `claude-sonnet-4-6` (escalate Opus nếu high-risk)
- Fixing → theo skill đang xử lý (implementer/reviewer)
- Closing → `claude-haiku-4-5-20251001` (documentation only)

## Usage

```
/resume-task T-XXXX
```

## Example

```
/resume-task T-0001
```

## What It Does

1. Reads task folder `docs/harness/tasks/T-XXXX-*/`
2. Reads current `status.md` to find phase
3. Loads `task.md`, `plan.md`, `contract.md`, `evaluation.md`
4. Resumes from current phase

## Phases

- **Created**: Task initialized, awaiting planning
- **Planning**: Plan in progress
- **Contracting**: Contract in progress
- **Implementing**: Implementation in progress
- **Evaluating**: Testing and checks in progress
- **Reviewing**: Quality/regression/contract-compliance review in progress
- **Fixing**: Issues found, being fixed
- **Closing**: Final cleanup, handoff
- **Done**: Task complete

## Example: Resume from Implementing

If task is in `Implementing` phase:
```
/resume-task T-0001
→ Reads current implementation status
→ Continues from where it left off
```

