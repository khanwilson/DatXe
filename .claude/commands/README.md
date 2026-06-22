# Harness Command Reference

Task-based workflow commands for DatXe multi-project harness.

## Quick Start

### Create & Run Full Task
```bash
/harness Add driver profile management to app_taixe and backend
```

### Manual Step-by-Step
```bash
/new-task My task description
/planner T-0001
/contract T-0001
/generator T-0001
/evaluator T-0001
/close-task T-0001
```

### Resume In-Progress Task
```bash
/resume-task T-0001
```

## Command Reference

| Command | Purpose | Phase |
|---------|---------|-------|
| `/harness <task>` | Create + run full workflow | All |
| `/new-task <task>` | Initialize task folder | Created |
| `/planner T-XXXX` | Create implementation plan | Planning |
| `/contract T-XXXX` | Define scope & acceptance | Contracting |
| `/generator T-XXXX` | Implement according to contract | Generating |
| `/evaluator T-XXXX` | Run checks & validation | Evaluating |
| `/close-task T-XXXX` | Finalize & document | Closing |
| `/resume-task T-XXXX` | Continue from current phase | Any |
| `/task-status T-XXXX` | View task progress | Any |

## Files

- `/harness.md` - Full workflow command
- `/new-task.md` - Task creation
- `/planner.md` - Planning phase
- `/contract.md` - Contract definition
- `/generator.md` - Implementation
- `/evaluator.md` - Testing & validation
- `/close-task.md` - Task completion
- `/resume-task.md` - Resume interrupted tasks
- `/task-status.md` - View task status

## Typical Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Create Task                                          │
│    /harness "Add X feature to Y project"                │
│    OR /new-task "Add X feature to Y project"            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Review & Plan                                        │
│    /planner T-0001                                      │
│    Review: docs/harness/tasks/T-0001-*/plan.md         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Define Contract (Scope & Boundaries)                │
│    /contract T-0001                                     │
│    Review: contract.md - Allowed Files, Out of Scope   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Implement                                            │
│    /generator T-0001                                    │
│    Output: implementation.md, files-changed.md          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Validate                                             │
│    /evaluator T-0001                                    │
│    Output: evaluation.md - PASS or FAIL                │
└─────────────────────────────────────────────────────────┘
                           ↓
                      FAIL? → /resume-task T-0001
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Close & Document                                     │
│    /close-task T-0001                                   │
│    Output: handoff.md, updated PROJECT_STATE.md         │
└─────────────────────────────────────────────────────────┘
```

## Task Folder Structure

```
docs/harness/tasks/T-0001-task-slug/
├── task.md              # Original requirement
├── status.md            # Current phase & progress
├── plan.md              # Implementation plan
├── contract.md          # Scope & boundaries (CRITICAL)
├── implementation.md    # What was done
├── files-changed.md     # File-level changes
├── decisions.md         # Task-scoped decisions
├── evaluation.md        # Test results (PASS/FAIL)
└── handoff.md           # Final summary & next steps
```

## Best Practices

1. **Always read contract before implementing**
   - Check `Allowed Files` - what can be modified
   - Check `Out of Scope` - what is protected
   - If need to exceed, ask first

2. **Evaluate must PASS before closing**
   - All tests passing
   - Lint passing
   - No breaking changes
   - No hard-coded secrets

3. **Close task creates handoff**
   - Lessons learned
   - API changes documented
   - Database changes documented
   - Next suggested tasks

4. **Resume from current phase**
   - `/resume-task T-XXXX` reads current status
   - Continues from where it left off

