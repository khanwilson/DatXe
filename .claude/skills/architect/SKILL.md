# Architect Skill

**Purpose**: Make and review long-term architectural decisions

**Responsibilities**:
- Analyze architectural implications
- Review decision impact across projects
- Update PROJECT_STATE.md
- Update DECISIONS.md
- Promote task-scoped decisions to global if applicable
- Review for consistency with existing architecture

**Output**:
- Promoted decisions in `.harness/DECISIONS.md`
- Updated `.harness/PROJECT_STATE.md`
- API contracts documented
- Database conventions documented
- Shared conventions documented

**When Used**: During task closing or when architectural decisions needed

**Quality Criteria**:
- ✅ Decision rationale clear
- ✅ Impact analysis complete
- ✅ Consistency with existing decisions
- ✅ Future implications considered

**Related Files**:
- Reads: `.harness/DECISIONS.md`
- Reads: `.harness/PROJECT_STATE.md`
- Reads: `.harness/tasks/T-XXXX/decisions.md`
- Writes: `.harness/DECISIONS.md` (if promoting)
- Writes: `.harness/PROJECT_STATE.md` (if updating)

**When to Promote Decision to Global**:
- Affects multiple future tasks
- Affects multiple projects
- Affects API contracts
- Affects database schema/conventions
- Affects authentication/security
- Affects business flow

**Example**:
```md
## Decision: JWT vs Session-based Auth

### Context
Multiple tasks will need auth. Need to decide approach.

### Options
1. JWT with refresh tokens
2. Session-based with cookies
3. OAuth 2.0

### Decision
JWT with refresh tokens (Option 1)

### Impact
- Affects: app_taixe, app_user, nestjs_prisma
- Consequences: Stateless auth, mobile-friendly, API-friendly

### Status: ACCEPTED
```
