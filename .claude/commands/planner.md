# Planner

Run planning phase for a task.

**Model**: Sonnet 4.6 (thinking task — requires scope analysis, risk assessment, dependency mapping)

## Usage

```
/planner T-XXXX
```

## Example

```
/planner T-0001
```

## What It Does

1. Reads `task.md` (requirement)
2. Reads `PROJECT_STATE.md` (current state)
3. Reads `DECISIONS.md` (established decisions)
4. Analyzes scope and complexity
5. Identifies affected projects
6. Identifies risks and dependencies
7. Creates `plan.md` with implementation approach

## Output

`plan.md` includes:
- Scope clarification
- Dependencies & risks
- Step-by-step implementation approach
- Testing strategy
- Estimated effort

## Next

After review, run `/contract T-XXXX` to create contract.

