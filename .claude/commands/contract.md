# Contract

Create or update contract for a task.

## Usage

```
/contract T-XXXX
```

## Example

```
/contract T-0001
```

## What It Does

1. Reads `task.md` (requirement)
2. Reads `plan.md` (approach)
3. Creates detailed `contract.md` with:
   - Scope (in/out)
   - **Allowed Files** - files that CAN be modified
   - **Out of Scope** - projects/files that CANNOT be modified
   - Impacted projects
   - API contracts (if applicable)
   - Database impact (if applicable)
   - Acceptance criteria
   - Test strategy

## Critical Sections

- ✅ **Allowed Files**: Defines modification boundaries
- ✅ **Out of Scope**: Defines what's protected
- ✅ **Acceptance Criteria**: Defines success

If implementation needs files outside `Allowed Files`, Claude **STOPS** and asks.

## Next

After review, run `/generator T-XXXX` to implement.

