# Harness

Full task workflow from creation to completion.

## Usage

```
/harness <task-description>
```

## Example

```
/harness Add driver profile management screen to app_taixe and backend API
```

## What It Does

Complete workflow:
1. Creates task folder
2. Reads `CLAUDE.md`, `PROJECT_STATE.md`, `DECISIONS.md`
3. Analyzes task requirements
4. Creates `plan.md`
5. Creates `contract.md` with scope, allowed files, acceptance criteria
6. Implements according to contract
7. Runs checks (lint, typecheck, test, build)
8. Runs evaluation
9. Creates handoff documentation
10. Updates `PROJECT_STATE.md`
11. Closes task

## Contract Enforcement

Task will **NOT** modify files outside `Allowed Files` section.

If implementation needs to touch other files, Claude will:
1. Stop and ask for approval
2. Wait for user guidance

## Checkpoints

- ✅ **After Planning**: Review `plan.md`
- ✅ **After Contracting**: Review `contract.md` scope & allowed files
- ✅ **After Generation**: Review implementation
- ✅ **After Evaluation**: Review test results
- ✅ **After Closing**: Review `handoff.md`

