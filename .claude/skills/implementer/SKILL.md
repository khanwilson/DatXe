# Implementer Skill

**Purpose**: Code implementation per contract boundaries

**Responsibilities**:
- Read contract.md & plan.md
- Implement per Allowed Files only
- STOP if needs to exceed contract
- Write clean, convention-following code
- Document implementation decisions
- Track file changes
- Record implementation notes

**Output**:
- Modified source files (per contract)
- `implementation.md` with what was done
- `files-changed.md` with file-level changes
- `decisions.md` with implementation decisions

**When Used**: `/generator T-XXXX` or automatic in `/harness` workflow

**Quality Criteria**:
- ✅ Only modifies Allowed Files
- ✅ Respects Out of Scope
- ✅ Follows project conventions
- ✅ Clean, readable code
- ✅ Documentation updated
- ✅ No hard-coded secrets

**Related Files**:
- Reads: `.harness/tasks/T-XXXX/contract.md`
- Reads: `.harness/tasks/T-XXXX/plan.md`
- Writes: Source files (per contract)
- Writes: `.harness/tasks/T-XXXX/implementation.md`
- Writes: `.harness/tasks/T-XXXX/files-changed.md`
- Writes: `.harness/tasks/T-XXXX/decisions.md`

**Safety Checks**:
- ✅ File path check: is this in Allowed Files?
- ✅ Scope check: is this in Out of Scope?
- ✅ Secrets check: no hard-coded keys
- ✅ Convention check: follows project patterns

**When STOP**:
- Needs to modify file outside Allowed Files
- Needs to touch Out of Scope project
- Discovers breaking API change not in contract
- Finds database schema issue not in contract

**Example Output**:
```md
## Implementation

### Backend (nestjs_prisma)
- Created auth.controller.ts
- Updated auth.service.ts
- Created JWT strategy

### Frontend (app_taixe)
- Updated LoginScreen.tsx
- Added useAuth hook

## Changes
M src/auth/auth.controller.ts (+50 -0)
A src/auth/strategies/jwt.strategy.ts (+30 -0)
...
```
