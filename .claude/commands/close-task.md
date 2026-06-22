# Close Task

Close and complete a task.

## Usage

```
/close-task T-XXXX
```

## Example

```
/close-task T-0001
```

## Prerequisites

- ✅ `evaluation.md` shows **PASS**
- ✅ All checks passing
- ✅ `handoff.md` ready

## What It Does

1. Verifies evaluation passed
2. Creates `handoff.md` with:
   - What was delivered
   - API changes
   - Database changes
   - Lessons learned
   - Next suggested tasks
3. Updates `PROJECT_STATE.md`:
   - New capabilities completed
   - API contracts added
   - Prisma models updated
   - Shared conventions documented
   - Technical debt noted
4. Updates `TASKS.md`:
   - Task status → Done
   - Task updated time
5. Promotes decisions to `DECISIONS.md` if applicable
6. Marks task status as `Done`

## Output

- `handoff.md` - Complete task summary
- Updated `PROJECT_STATE.md`
- Updated `TASKS.md`
- Updated `DECISIONS.md` (if applicable)

## Next

Review handoff, then start next task with `/harness <description>`

