---
name: contractor
description: Harness Contractor. Use after plan.md is approved to define explicit scope, Allowed Files, Out of Scope, acceptance criteria, constraints, checks, and handoff boundaries.
when_to_use: Use during the Contracting phase of /harness or when a task needs a precise contract before implementation.
argument-hint: T-XXXX
context: fork
agent: harness-contractor
allowed-tools:
  - Read
  - Write
  - Edit
  - MultiEdit
  - Grep
  - Glob
  - Bash
---

# Contractor Skill

Run the Harness Contracting phase for `$ARGUMENTS`.

This skill intentionally runs in a forked subagent context through `agent: harness-contractor` so contracting uses the Contractor subagent and its configured Sonnet model.

## Purpose

Create `.harness/tasks/<TASK_ID>/contract.md` with clear implementation boundaries.

## Read First

- `.claude/commands/harness.md`
- `.harness/tasks/<TASK_ID>/task.md` or `description.md`
- `.harness/tasks/<TASK_ID>/plan.md`
- `.harness/PROJECT_STATE.md` if present
- `.harness/DECISIONS.md` if present
- Relevant `CLAUDE.md` files

## Responsibilities

- Define scope and out-of-scope items.
- Define `Allowed Files` exactly.
- Define protected files/projects.
- Define acceptance criteria that are testable.
- Identify API contracts, database impact, security impact, and release/native risk when applicable.
- Define required checks: lint, typecheck, tests, build, manual verification.
- Detect if Architect escalation is needed before implementation.

## Output

Write:

- `.harness/tasks/<TASK_ID>/contract.md`
- update `.harness/tasks/<TASK_ID>/status.md` if present

## Stop / Return Blocker

Return `BLOCKER` when:

- `Allowed Files` cannot be determined safely.
- The plan is ambiguous or conflicts with project state.
- Architecture boundary needs a decision first.
- User scope/product decision is required.

## Required `contract.md` Sections

```md
# Contract: <TASK_ID>

## Scope

## Out of Scope

## Allowed Files

## Protected Files / Projects

## Acceptance Criteria

## Required Checks

## API Contract

## Database / Migration Impact

## Security / Secrets / Auth Impact

## Implementation Constraints

## Escalation Triggers

## User Approvals

## Status
```
