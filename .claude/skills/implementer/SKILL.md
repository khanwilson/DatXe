---
name: implementer
description: Harness Implementer. Use after plan.md and contract.md exist to implement or fix strictly within Allowed Files.
when_to_use: Use during Implementing/Fixing phase of /harness after plan.md is approved and contract.md exists. This skill must fork into harness-implementer; do not implement inline in the main harness context.
argument-hint: T-XXXX or task folder path
context: fork
agent: harness-implementer
allowed-tools:
  - Read
  - Write
  - Edit
  - MultiEdit
  - Grep
  - Glob
  - Bash
  - LS
---

# Implementer Skill

Run the Harness Implementing/Fixing phase for `$ARGUMENTS`.

This skill is a thin entrypoint. It must execute in a forked subagent context through `agent: harness-implementer` so the real implementation runs with the Implementer subagent and its configured Opus model.

## Purpose

Implement code strictly according to `.harness/tasks/<TASK_ID>/contract.md`.

## Read First

- `.claude/commands/harness.md`
- `.harness/tasks/<TASK_ID>/status.md` if present
- `.harness/tasks/<TASK_ID>/task.md` or `description.md`
- `.harness/tasks/<TASK_ID>/plan.md`
- `.harness/tasks/<TASK_ID>/contract.md`
- files listed under `Allowed Files`
- targeted nearby files only when needed for implementation context

## Responsibilities

- Implement only what the contract requires.
- Modify only files listed in `Allowed Files`.
- Respect `Out of Scope`.
- Keep changes minimal and convention-following.
- Avoid hard-coded secrets.
- Record implementation decisions and changed files.
- Return blockers instead of guessing or expanding scope.

## Output

Write/update:

- `.harness/tasks/<TASK_ID>/implementation.md`
- `.harness/tasks/<TASK_ID>/files-changed.md`
- `.harness/tasks/<TASK_ID>/decisions.md` if implementation decisions were made
- `.harness/tasks/<TASK_ID>/status.md` if present

## TASKS.md Status Update

After implementation completes successfully:

1. Read `.harness/TASKS.md`
2. Find the row for `<TASK_ID>` in the task index table
3. Update the row:
   - `Status`: `In Progress`
   - `Phase`: `Implementing`

## Stop / Return Blocker

Return `BLOCKER` when:

- A needed edit is outside `Allowed Files`.
- Contract is ambiguous, insufficient, or wrong.
- Scope/product decision is required.
- Root cause is unclear after focused investigation.
- Implementation repeatedly fails.
- Database/auth/payment/billing/security/native signing/release risk appears but is not in contract.

## Required Implementation Template

```md
# Implementation: <TASK_ID>

## Summary

## Files Changed
| File | Change | Reason |
|---|---|---|

## Implementation Decisions

## Notes for Evaluation

## Status
Implemented / Blocked
```
