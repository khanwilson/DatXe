# Task Registry

**Last Updated**: 2026-06-22  
**Total Tasks**: 0  
**Completed**: 0  
**In Progress**: 0  
**Blocked**: 0

---

## Task Index

| ID | Title | Status | Phase | Priority | Depends On | Projects | Created | Updated | Folder |
|----|-------|--------|-------|----------|-----------|----------|---------|---------|--------|
| *None yet* | - | - | - | - | - | - | - | - | - |

---

## Status Legend

- **Planned** - Task created, awaiting planning
- **In Progress** - Task currently being worked on
- **Blocked** - Task waiting on external dependency or decision
- **Done** - Task completed and closed
- **Cancelled** - Task cancelled (see task folder for reason)

## Phase Legend

- **Created** - Task folder initialized, awaiting planning
- **Planning** - Planner analyzing requirements
- **Contracting** - Contract being defined
- **Generating** - Implementation in progress
- **Evaluating** - Testing, checks, validation
- **Fixing** - Issues found, being fixed
- **Closing** - Final cleanup, handoff documentation
- **Done** - Task complete

## Priority Legend

- **P0** - Blocker, critical path
- **P1** - High priority, needed soon
- **P2** - Normal priority
- **P3** - Nice to have, lower priority

## Project Values

- `app_taixe` - Driver mobile app
- `app_user` - Customer mobile app
- `nestjs_prisma` - Backend API
- `docs` - Documentation
- `harness` - Task management & harness

---

## How to Add Tasks

1. Run: `./scripts/harness/create-task.sh "Task title"`
2. This creates folder `T-XXXX-slug` and initializes all task files
3. Update this index via `./scripts/harness/update-task-index.sh`

## How to Close Tasks

1. Update task `status.md` to mark phase as `Done`
2. Update task `evaluation.md` with final results
3. Update task `handoff.md` with lessons learned
4. Run: `/close-task T-XXXX`
5. This updates `TASKS.md`, `PROJECT_STATE.md`, and `DECISIONS.md`

---

## Dependency Graph

*(None yet)*

Example when dependencies exist:
```
T-0001 (Setup DB)
  ↓
T-0002 (Implement User model) → depends on T-0001
  ↓
T-0003 (Auth API) → depends on T-0002
  ├→ T-0004 (Driver registration) → depends on T-0003
  └→ T-0005 (Customer registration) → depends on T-0003
```

