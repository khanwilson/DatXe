---
name: reviewer
description: Harness Reviewer. Use after evaluation to review quality, correctness, regression risk, contract compliance, edge cases, and write review.md.
when_to_use: Use during Reviewing phase of /harness after evaluation passes, or when a fix loop needs an independent quality/risk review.
argument-hint: T-XXXX
context: fork
agent: harness-reviewer
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# Reviewer Skill

Run the Harness Reviewing phase for `$ARGUMENTS`.

This skill intentionally runs in a forked subagent context through `agent: harness-reviewer` so review uses the Reviewer subagent and its configured Sonnet model.

## Purpose

Review implementation quality, correctness, risk, edge cases, and contract compliance. Write `.harness/tasks/<TASK_ID>/review.md`.

## Read First

- `.claude/commands/harness.md`
- `.harness/tasks/<TASK_ID>/plan.md`
- `.harness/tasks/<TASK_ID>/contract.md`
- `.harness/tasks/<TASK_ID>/implementation.md` if present
- `.harness/tasks/<TASK_ID>/files-changed.md` if present
- `.harness/tasks/<TASK_ID>/evaluation.md`
- Modified source files

## Responsibilities

- Review correctness and edge cases.
- Review security, auth, input validation, secrets, injection risks.
- Review performance and regression risk.
- Review code quality and conventions.
- Verify contract compliance.
- Identify missing checks/tests.
- Decide PASS, FAIL_FIXABLE, or BLOCKER.

## Output

Write:

- `.harness/tasks/<TASK_ID>/review.md`
- update `.harness/tasks/<TASK_ID>/status.md` if present

## Decision Rules

- `PASS` when no blocking issues remain and risk is acceptable.
- `FAIL_FIXABLE` when issues are clear, low/medium risk, and fixable inside `Allowed Files`.
- `BLOCKER` when high-risk, architecture-impacting, unclear, or requires user/contract decision.

## Required `review.md` Sections

```md
# Review: <TASK_ID>

## Summary

## Contract Compliance

## Correctness

## Edge Cases

## Security

## Performance

## Code Quality

## Test Coverage

## Issues Found

## Risk Assessment

## Decision
PASS | FAIL_FIXABLE | BLOCKER
```
