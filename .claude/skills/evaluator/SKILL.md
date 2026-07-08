---
name: evaluator
description: Harness Evaluator. Use after implementation to run/check lint, typecheck, tests, build, contract compliance, acceptance criteria, and write evaluation.md.
when_to_use: Use during Evaluating phase of /harness after implementation or after a fix loop.
argument-hint: T-XXXX
context: fork
agent: harness-evaluator
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# Evaluator Skill

Run the Harness Evaluating phase for `$ARGUMENTS`.

This skill intentionally runs in a forked subagent context through `agent: harness-evaluator` so evaluation uses the Evaluator subagent and its configured Sonnet model.

## Purpose

Validate the implementation against the contract and write `.harness/tasks/<TASK_ID>/evaluation.md`.

## Read First

- `.claude/commands/harness.md`
- `.harness/tasks/<TASK_ID>/plan.md`
- `.harness/tasks/<TASK_ID>/contract.md`
- `.harness/tasks/<TASK_ID>/implementation.md` if present
- `.harness/tasks/<TASK_ID>/files-changed.md` if present
- Relevant package scripts/config files needed to run checks

## Responsibilities

- Verify only `Allowed Files` were modified.
- Verify no Out of Scope files/projects were touched.
- Run or document required checks from `contract.md`.
- Validate acceptance criteria.
- Check for hard-coded secrets and obvious security risks.
- Identify clear root cause for failures.
- Decide PASS/FAIL based on evidence.

## Output

Write:

- `.harness/tasks/<TASK_ID>/evaluation.md`
- update `.harness/tasks/<TASK_ID>/status.md` if present

## TASKS.md Status Update

After evaluation completes:

1. Read `.harness/TASKS.md`
2. Find the row for `<TASK_ID>` in the task index table
3. Update the row based on evaluation result:
   - If `PASS`: `Phase` → `Evaluating`
   - If `FAIL_FIXABLE`: `Phase` → `Fixing`
   - If `BLOCKER`: `Status` → `Blocked`, `Phase` → `Evaluating`

## Result Rules

- `PASS` only when required checks and acceptance criteria pass or are explicitly marked not applicable with rationale.
- `FAIL_FIXABLE` when root cause is clear and fix is inside `Allowed Files`.
- `BLOCKER` when root cause is unclear, repeated failures occur, fix requires contract/scope change, or high-risk areas are involved.

## Required `evaluation.md` Sections

```md
# Evaluation: <TASK_ID>

## Summary

## Commands Run

## Results

## Contract Compliance

## Acceptance Criteria

## Security / Secrets Check

## Failures / Root Cause

## Fix Recommendation

## Decision
PASS | FAIL_FIXABLE | BLOCKER
```
