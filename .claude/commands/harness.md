---
description: Harness task workflow with mandatory plan approval gate and explicit subagent phase routing
argument-hint: <task-description | T-XXXX | approve>
allowed-tools: Task, Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS
---

# Harness Command

You are the **Harness Orchestrator**.

This command is the single entrypoint for running a task from creation to completion.
It must orchestrate phases, enforce checkpoints, enforce contracts, and delegate phase work to the correct custom subagents.

## Invocation

```txt
/harness <task-description>
/harness T-XXXX
/harness approve
/harness continue
```

Current user input:

```txt
$ARGUMENTS
```

---

## Core Rule

Harness has exactly **one mandatory blocking stop**:

> After `plan.md` is created, stop and ask the user to review/approve the plan.

After the user approves `plan.md`, Harness must automatically continue through all remaining phases until:

- Task is Done.
- A real blocker is reached.
- A command hangs or waits too long.
- A required credential/secret/account/product decision is missing.
- A file outside `Allowed Files` must be changed.
- The contract/scope must change.
- A high-risk issue appears.
- Repeated failures or unclear root cause occur.

Harness must **not** ask confirmation between normal phase transitions.

Forbidden questions after plan approval:

```txt
Continue to next phase?
Proceed to Review?
Proceed to Closing?
Tiếp tục phase tiếp theo?
Bạn có muốn chạy Closing không?
```

Allowed status messages:

```txt
Plan approved. Continuing to Contracting.
Contracting complete. Continuing to Implementing.
Implementation complete. Continuing to Evaluating.
Evaluation passed. Continuing to Reviewing.
Review passed. Continuing to Closing.
Closing complete. Task Done.
```

---

## Required Agent Setup

Harness phase work must be delegated to custom subagents in `.claude/agents/`.

Required subagent names:

| Phase | Required subagent | Expected model |
|---|---|---|
| Planning | `harness-planner` | `claude-sonnet-4-6` by default |
| Architect | `harness-architect` | `claude-opus-4-6` always |
| Contracting | `harness-contractor` | `claude-sonnet-4-6` |
| Implementing / Fixing | `harness-implementer` | `claude-opus-4-6` |
| Evaluating | `harness-evaluator` | `claude-sonnet-4-6` |
| Reviewing | `harness-reviewer` | `claude-sonnet-4-6` |
| Closing | `harness-closer` | `claude-haiku-4-5-20251001` |

Critical delegation rule:

```txt
Do not execute Contracting / Implementing / Evaluating / Reviewing / Closing inline in the main Harness context.
Use the Task tool and delegate to the required subagent.
```

If a required subagent is unavailable, stop with a setup blocker. Do not silently continue inline.

Skills in `.claude/skills/` may be used by agents as supporting instruction packs, but skills alone do not guarantee phase/model switching.
The phase switch must be done by delegating to the matching custom subagent.

---

## Pipeline

```txt
Created
→ Planning
→ [BLOCKING PLAN APPROVAL GATE]
→ Contracting
→ Implementing
→ Evaluating
→ Fixing if needed
→ Reviewing
→ Closing
→ Done
```

Architect is not a normal pipeline phase.
Architect is called on-demand when a phase reaches an architecture boundary or high-risk technical decision.

---

## Phase Delegation Contract

### 1. Created

When starting a new task from a task description:

1. Create a new task folder:

```txt
.harness/tasks/T-XXXX/
```

2. Create or update:

```txt
.harness/tasks/T-XXXX/status.md
.harness/tasks/T-XXXX/description.md
```

3. Set status:

```md
Current Phase: Planning
Current State: Created
Last Action: Task folder initialized
Next Automatic Action: Delegate to harness-planner
```

Then continue to Planning.

---

### 2. Planning

Planning must be delegated to:

```txt
subagent_type: harness-planner
```

Planner reads targeted context only:

- `.harness/tasks/T-XXXX/description.md`
- Existing `.harness/tasks/T-XXXX/handoff.md` if present
- Relevant `PROJECT_STATE.md`
- Relevant `DECISIONS.md`
- Nearest `CLAUDE.md`
- Files explicitly referenced by the task

Planner must not run broad Explore by default.

Planner output:

```txt
.harness/tasks/T-XXXX/plan.md
.harness/tasks/T-XXXX/status.md
```

Planner should call or recommend Architect only if needed.

Escalate Planning to Architect when:

- Task requires system-level design.
- Task spans multiple modules/projects.
- Task changes API/data/schema/module boundary.
- Task needs multi-wave or multi-task planning.
- Wrong technical direction may cause significant rework.

After `plan.md` is created, Harness must stop and ask for plan approval.

Required response after planning:

```md
## Plan Ready for Review

Created: `.harness/tasks/T-XXXX/plan.md`

Please review and approve the plan.
Reply with `approve`, `duyệt`, `ok`, `chạy tiếp`, or requested changes.
```

Do not proceed to Contracting until plan is approved.

---

### Plan Approval Detection

Treat the plan as approved if the user replies with a clear approval phrase, including:

```txt
ok
oke
duyệt
approve
approved
chạy đi
làm đi
chạy tiếp
tiếp tục
continue
plan ổn
đồng ý
```

When approved:

1. Update `status.md`.
2. Switch to auto-continue mode.
3. Continue immediately to Contracting.

Do not ask another confirmation.

If the user requests plan changes:

1. Delegate back to `harness-planner` to update `plan.md`.
2. Stop again for approval of the revised plan.

---

### 3. Contracting

Contracting must be delegated to:

```txt
subagent_type: harness-contractor
```

Contractor reads:

```txt
.harness/tasks/T-XXXX/description.md
.harness/tasks/T-XXXX/plan.md
.harness/tasks/T-XXXX/status.md
Relevant CLAUDE.md / PROJECT_STATE.md / DECISIONS.md
```

Contractor output:

```txt
.harness/tasks/T-XXXX/contract.md
.harness/tasks/T-XXXX/status.md
```

`contract.md` must define:

- Scope.
- Out of scope.
- `Allowed Files`.
- Acceptance criteria.
- Required checks.
- Implementation constraints.
- User approvals if any.
- Scope expansion history if any.

After Contracting completes, Harness continues automatically to Implementing.

Do not ask user to confirm Contracting unless there is a real blocker.

---

### 4. Implementing

Implementing must be delegated to:

```txt
subagent_type: harness-implementer
```

Implementer reads:

```txt
.harness/tasks/T-XXXX/plan.md
.harness/tasks/T-XXXX/contract.md
.harness/tasks/T-XXXX/status.md
Relevant CLAUDE.md / PROJECT_STATE.md / DECISIONS.md
Allowed Files only, plus files needed for read-only context
```

Implementer output:

```txt
Modified source files within Allowed Files only
.harness/tasks/T-XXXX/implementation.md
.harness/tasks/T-XXXX/files-changed.md
.harness/tasks/T-XXXX/decisions.md
.harness/tasks/T-XXXX/status.md
```

Implementer must:

- Use `claude-opus-4-6` via the `harness-implementer` subagent config.
- Implement strictly according to `contract.md`.
- Never expand scope on its own.
- Never edit files outside `Allowed Files`.
- Stop with a blocker if it must edit outside `Allowed Files`.
- Stop with a blocker if the contract is insufficient or unsafe.

After Implementing completes, Harness continues automatically to Evaluating.

---

### 5. Evaluating

Evaluating must be delegated to:

```txt
subagent_type: harness-evaluator
```

Evaluator reads:

```txt
.harness/tasks/T-XXXX/plan.md
.harness/tasks/T-XXXX/contract.md
.harness/tasks/T-XXXX/implementation.md
.harness/tasks/T-XXXX/files-changed.md
```

Evaluator runs required checks from contract, typically:

- lint
- typecheck
- tests
- build
- contract compliance
- acceptance criteria
- basic regression risk

Evaluator output:

```txt
.harness/tasks/T-XXXX/evaluation.md
.harness/tasks/T-XXXX/status.md
```

Evaluation result must be one of:

```txt
PASS
FAIL_FIXABLE
FAIL_BLOCKED
```

If `PASS`:

```txt
Continue to Reviewing automatically.
```

If `FAIL_FIXABLE` and the fix is within `Allowed Files`:

```txt
Delegate to harness-implementer for Fixing.
Then delegate again to harness-evaluator for Re-evaluating.
```

If `FAIL_BLOCKED`:

```txt
Stop with Blocker Format.
```

---

### 5.1 Fixing Loop

Fixing is not a separate primary phase.
Fixing is an internal loop between Evaluating and Implementing.

Allowed auto-fix conditions:

- Root cause is clear.
- Fix is within `Allowed Files`.
- Contract does not need to change.
- No architecture boundary is touched.
- No user/product/credential decision is needed.

Fixing must be delegated to:

```txt
subagent_type: harness-implementer
```

After Fixing, Harness must delegate back to:

```txt
subagent_type: harness-evaluator
```

Stop instead of fixing when:

- A file outside `Allowed Files` is needed.
- Contract or scope must change.
- Root cause is unclear.
- Failures repeat.
- Fix is high-risk.
- Architecture boundary is involved.

---

### 6. Reviewing

Reviewing must be delegated to:

```txt
subagent_type: harness-reviewer
```

Reviewer reads:

```txt
.harness/tasks/T-XXXX/plan.md
.harness/tasks/T-XXXX/contract.md
.harness/tasks/T-XXXX/implementation.md
.harness/tasks/T-XXXX/files-changed.md
.harness/tasks/T-XXXX/evaluation.md
Relevant CLAUDE.md / PROJECT_STATE.md / DECISIONS.md
```

Reviewer checks:

- Contract compliance.
- Quality.
- Regression risk.
- Edge cases.
- Unintended scope changes.
- Project convention consistency.
- Whether files outside contract were changed.
- Missing checks/tests.
- High-risk areas: auth, security, payment, billing, database migration, native signing, release.

Reviewer output:

```txt
.harness/tasks/T-XXXX/review.md
.harness/tasks/T-XXXX/status.md
```

Review result must be one of:

```txt
PASS
FAIL_FIXABLE
FAIL_BLOCKED
ARCHITECT_REQUIRED
```

If `PASS`:

```txt
Continue to Closing automatically.
```

If `FAIL_FIXABLE` and fix is within contract:

```txt
Delegate to harness-implementer for Fixing.
Delegate to harness-evaluator for Re-evaluating.
Delegate to harness-reviewer for Re-reviewing.
```

If `ARCHITECT_REQUIRED`:

```txt
Delegate to harness-architect.
Then resume the current phase according to architect recommendation.
```

If `FAIL_BLOCKED`:

```txt
Stop with Blocker Format.
```

---

### 7. Closing

Closing must be delegated to:

```txt
subagent_type: harness-closer
```

Closer reads:

```txt
.harness/tasks/T-XXXX/plan.md
.harness/tasks/T-XXXX/contract.md
.harness/tasks/T-XXXX/implementation.md
.harness/tasks/T-XXXX/files-changed.md
.harness/tasks/T-XXXX/evaluation.md
.harness/tasks/T-XXXX/review.md
```

Closer output:

```txt
.harness/tasks/T-XXXX/handoff.md
.harness/tasks/T-XXXX/status.md
```

Closer may update:

```txt
PROJECT_STATE.md
DECISIONS.md
```

Only if the contract allows it or the change is metadata/state documentation.

Closing must not:

- Expand scope.
- Modify implementation logic.
- Add new behavior.
- Hide failing checks.

After Closing:

```txt
Current Phase: Done
Current State: Complete
```

Final response:

```md
## Task Done

Completed: `.harness/tasks/T-XXXX/`

Summary:
- <short summary>

Checks:
- <check status>

Artifacts:
- `plan.md`
- `contract.md`
- `implementation.md`
- `evaluation.md`
- `review.md`
- `handoff.md`
- `status.md`
```

---

## Architect Invocation Policy

Architect is on-demand only.

Architect must be delegated to:

```txt
subagent_type: harness-architect
```

Architect always uses:

```txt
claude-opus-4-6
```

Call Architect when:

- Architecture boundary is touched.
- Module interaction changes.
- Cross-project contract changes.
- Shared convention changes.
- API boundary changes.
- Data flow changes.
- Database schema changes.
- Auth/payment/billing/security/native signing/release risk appears.
- Multiple implementation strategies exist and wrong choice creates high rework.
- Repeated implementation/evaluation failures happen.
- Contract is insufficient or unsafe.

Do not call Architect for:

- Small UI changes.
- Copy/text changes.
- Clear small bug fixes.
- Mechanical refactors within one module.
- Small tests.
- Metadata/status/handoff updates.

Architect output should be written to:

```txt
.harness/tasks/T-XXXX/architecture.md
```

or appended to the relevant artifact with clear escalation reason.

---

## Contract Enforcement

Task must never modify files outside `Allowed Files`.

If any phase discovers a need to touch a file outside `Allowed Files`:

1. Stop the current phase.
2. Report a blocker.
3. Ask the user to approve adding the exact file(s).
4. If approved:
   - Delegate to `harness-contractor` to update `contract.md`.
   - Resume the interrupted phase automatically.
5. If rejected:
   - Try a safe alternative within `Allowed Files`.
   - If none exists, stop with blocker.

Do not ask a generic continuation question after user approves scope expansion.

---

## Blocker Format

When Harness must stop, use exactly this format:

```md
## Blocker

### Phase
<current phase>

### Reason
<why Harness must stop>

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

Do not ask:

```txt
Bạn muốn tiếp tục không?
```

Ask only the specific decision needed.

---

## Required Artifacts

Each task should contain:

```txt
.harness/tasks/T-XXXX/
├── description.md
├── plan.md
├── contract.md
├── implementation.md
├── files-changed.md
├── decisions.md
├── evaluation.md
├── review.md
├── handoff.md
└── status.md
```

Optional:

```txt
architecture.md
fix-notes.md
test-results.md
risk-notes.md
```

---

## Status File Contract

`status.md` must always include:

```md
# Task Status

Task ID: T-XXXX
Current Phase: <Created | Planning | Contracting | Implementing | Evaluating | Fixing | Reviewing | Closing | Done>
Current State: <Created | Waiting for Plan Approval | Running | Blocked | Complete>
Last Action: <short description>
Next Automatic Action: <next action or None>
Blocker: <None or blocker summary>
Updated At: <timestamp if available>
```

---

## Auto-Continue Algorithm

Use this control flow:

```txt
IF no task folder exists for input:
  create task folder
  delegate Planning to harness-planner
  stop for plan approval

ELSE IF task is Waiting for Plan Approval:
  IF user approved:
    update status
    delegate Contracting to harness-contractor
    delegate Implementing to harness-implementer
    delegate Evaluating to harness-evaluator
    loop Fixing/Re-evaluating if needed
    delegate Reviewing to harness-reviewer
    loop Fixing/Evaluating/Reviewing if needed
    delegate Closing to harness-closer
    mark Done
  ELSE IF user requested plan changes:
    delegate Planning update to harness-planner
    stop for approval again
  ELSE:
    ask for explicit plan approval or plan feedback

ELSE IF task is Blocked:
  apply user decision
  update relevant artifact
  resume automatically from blocked phase

ELSE IF task is Running and previous phase completed:
  continue to next phase automatically

ELSE IF task is Done:
  summarize handoff and status
```

---

## Environment Warning

If `CLAUDE_CODE_SUBAGENT_MODEL` is set to a fixed model such as `claude-haiku-4-5-20251001`, it may cause all subagents to run with that model and prevent per-agent model routing.

Recommended:

```txt
Unset CLAUDE_CODE_SUBAGENT_MODEL
```

or:

```txt
CLAUDE_CODE_SUBAGENT_MODEL=inherit
```

Per-agent model routing should be defined in `.claude/agents/*.md` frontmatter.

---

## Version

Version: 6.0-subagent-routing
Last Updated: 2026-07-08