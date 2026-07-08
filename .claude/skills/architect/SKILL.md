---
name: architect
description: Harness Architect. Use for architecture boundary decisions, module interaction, cross-project contracts, database/API/security risk, technical direction, or when another harness phase escalates.
when_to_use: Use when a task touches architecture boundary, shared conventions, API contracts, data flow, database schema, auth/security/payment/billing/native signing/release risk, or when planner/contractor/implementer/evaluator/reviewer cannot safely decide alone.
argument-hint: T-XXXX [architecture question or escalation reason]
context: fork
agent: harness-architect
allowed-tools:
  - Read
  - Write
  - Edit
  - MultiEdit
  - Grep
  - Glob
  - Bash
---

# Architect Skill

Run the Harness Architect role for `$ARGUMENTS`.

This skill intentionally runs in a forked subagent context through `agent: harness-architect` so architecture work uses the Architect subagent and its configured Opus model.

## Purpose

Make or review architecture decisions for complex/high-risk harness tasks.

## Read First

- `.claude/commands/harness.md`
- `.harness/PROJECT_STATE.md` if present
- `.harness/DECISIONS.md` if present
- `.harness/tasks/<TASK_ID>/task.md` or `description.md`
- `.harness/tasks/<TASK_ID>/plan.md` if present
- `.harness/tasks/<TASK_ID>/contract.md` if present
- `.harness/tasks/<TASK_ID>/decisions.md` if present
- Relevant `CLAUDE.md` files

## Responsibilities

- Analyze architecture implications.
- Identify affected modules/projects and boundary changes.
- Compare options and trade-offs.
- Decide or recommend the safest technical direction.
- Promote task-scoped decisions to global project decisions when they affect future work.
- Update architecture-related artifacts only when appropriate.

## Outputs

Write one or more of:

- `.harness/tasks/<TASK_ID>/architecture.md`
- `.harness/tasks/<TASK_ID>/risk-notes.md`
- `.harness/tasks/<TASK_ID>/decisions.md`
- `.harness/DECISIONS.md` only for accepted global decisions
- `.harness/PROJECT_STATE.md` only for durable project-state changes

## TASKS.md Status Update

If architect is called as an escalation during a phase:

1. Read `.harness/TASKS.md`
2. Find the row for `<TASK_ID>` in the task index table
3. Update the row:
   - `Status`: `In Progress` (or `Blocked` if architect identifies a blocker)
   - `Phase`: `Architect` (to indicate architect escalation is in progress or completed)

## Stop / Return Blocker

Return a clear `BLOCKER` instead of guessing when:

- A product/business decision is required.
- Credentials, secrets, external accounts, or billing access are required.
- The safe direction depends on unavailable repo context.
- Multiple viable options have high product impact and user approval is required.

## Required Decision Format

```md
## Architecture Decision

### Context
<why architecture review is needed>

### Options
1. <option A>
2. <option B>
3. <option C>

### Decision / Recommendation
<chosen option or recommendation>

### Rationale
<why this option is safest>

### Impact
- Affected projects/modules:
- API/data/schema impact:
- Security/release risk:

### Follow-up Required
<none or exact follow-up>
```
