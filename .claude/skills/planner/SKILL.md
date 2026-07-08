---
name: planner
description: Harness Planner. Use to analyze a task and create plan.md. Default model is Sonnet through harness-planner; use harness-planner-opus for master plans, multi-wave planning, or system-level planning.
when_to_use: Use at the start of a harness task before user approval gate. Escalate to Opus/Architect for multi-system, multi-wave, architecture-boundary, or high-risk planning.
argument-hint: T-XXXX or task description
context: fork
agent: harness-planner
allowed-tools:
  - Read
  - Write
  - Edit
  - MultiEdit
  - Grep
  - Glob
  - Bash
---

# Planner Skill

Run the Harness Planning phase for `$ARGUMENTS`.

This skill intentionally runs in a forked subagent context through `agent: harness-planner` so ordinary planning uses the Planner subagent and its configured Sonnet model.

For master plans, multi-wave plans, planning that splits a wave into multiple tasks, or system-level architecture planning, use the Opus planner subagent `harness-planner-opus` or escalate to `harness-architect` before finalizing the plan.

## Purpose

Create `.harness/tasks/<TASK_ID>/plan.md`, then stop for user approval.

## Read First

- `.claude/commands/harness.md`
- `.harness/tasks/<TASK_ID>/task.md` or `description.md`
- `.harness/PROJECT_STATE.md` if present
- `.harness/DECISIONS.md` if present
- Relevant `CLAUDE.md` files
- Files explicitly referenced by the task

Do not run broad exploration by default. Use targeted reads first.

## Responsibilities

- Clarify task goal and requirements.
- Identify affected projects/modules.
- Identify dependencies and risks.
- Decide whether Architect escalation is required.
- Produce an actionable implementation approach.
- Define testing strategy.
- Stop after creating `plan.md` for user approval.

## Output

Write:

- `.harness/tasks/<TASK_ID>/plan.md`
- update `.harness/tasks/<TASK_ID>/status.md` if present

## Stop Rule

After `plan.md` is created, stop and ask user to approve the plan. Do not continue to Contracting until approval.

## Required `plan.md` Sections

```md
# Plan: <TASK_ID>

## Goal

## Requirements

## Affected Areas

## Proposed Approach

## Phases / Steps

## Risks and Mitigations

## Architect Required?
Yes | No

## Testing Strategy

## Estimated Effort

## Approval Gate
Waiting for user approval before Contracting.
```
