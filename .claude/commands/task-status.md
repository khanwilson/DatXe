# Task Status

View current status of a task.

**Model**: Haiku 4.5 (documentation task — just reads and displays status)

## Usage

```
/task-status T-XXXX
```

## Example

```
/task-status T-0001
```

## What It Shows

- Task ID and title
- Current phase
- Current status
- Progress checklist
- Blockers (if any)
- Recent updates

## Output Example

```
Task: T-0001 - Implement user registration
Status: In Progress
Phase: Generating
Progress:
  ✅ Task created
  ✅ Plan drafted
  ✅ Contract approved
  ⏳ Implementation in progress
  - Tests written
  - Evaluation passing
  - Handoff ready

Blockers: None
Last Updated: 2026-06-22 10:30
```

