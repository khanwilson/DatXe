# Contractor Skill

**Model**: Opus 4.8 (scope boundary analysis, contract definition)

**Purpose**: Define explicit scope boundaries and acceptance criteria

**Responsibilities**:
- Read task.md & plan.md
- Define clear scope (in/out)
- List Allowed Files (what CAN be modified)
- List Out of Scope (what is PROTECTED)
- Define acceptance criteria
- Identify API contracts
- Identify database impacts
- Define test strategy

**Output**: `contract.md` with:
- Clear scope (in/out)
- Allowed Files (modification boundaries)
- Out of Scope (protected projects/files)
- Acceptance criteria
- API contracts (if applicable)
- Database impact (if applicable)
- Test strategy

**When Used**: `/contract T-XXXX` or automatic in `/harness` workflow

**Quality Criteria**:
- ✅ Allowed Files clearly defined
- ✅ Out of Scope clearly protected
- ✅ Acceptance criteria are testable
- ✅ API contracts documented (if applicable)
- ✅ Database changes documented (if applicable)

**Related Files**:
- Reads: `.harness/tasks/T-XXXX/task.md`
- Reads: `.harness/tasks/T-XXXX/plan.md`
- Writes: `.harness/tasks/T-XXXX/contract.md`

**Critical Sections**:
- ✅ **Allowed Files** - Defines modification boundaries
- ✅ **Out of Scope** - Defines what is protected
- ✅ **Acceptance Criteria** - Defines success

**Example Output**:
```md
## Allowed Files
- app_taixe/**
- nestjs_prisma/**
- .harness/**

## Out of Scope
- app_user/**

## Acceptance Criteria
- [ ] API endpoint works
- [ ] Tests pass
- [ ] Lint/build succeeds
- [ ] No hard-coded secrets
```
