# Evaluator Skill

**Purpose**: Validate implementation against contract & quality standards

**Responsibilities**:
- Run quality checks (lint, typecheck, test, build)
- Verify contract compliance
- Verify acceptance criteria met
- Check for hard-coded secrets
- Verify API contracts
- Verify database changes
- Document evaluation results

**Output**: `evaluation.md` with:
- Test results (PASS/FAIL)
- Lint results
- Build results
- Contract compliance verification
- Acceptance criteria check
- Security review (secrets, SQL injection, XSS, etc.)

**When Used**: `/evaluator T-XXXX` or automatic in `/harness` workflow

**Quality Criteria**:
- ✅ All lint errors: 0
- ✅ All typecheck errors: 0
- ✅ All tests: PASS
- ✅ Build: SUCCESS
- ✅ No hard-coded secrets
- ✅ No breaking changes
- ✅ All acceptance criteria: ✓

**Related Files**:
- Reads: `.harness/tasks/T-XXXX/contract.md`
- Reads: Source files (modified)
- Writes: `.harness/tasks/T-XXXX/evaluation.md`

**Checks Performed**:
1. **Code Quality**
   - lint ✅
   - typecheck ✅
   - no secrets ✅

2. **Functionality**
   - tests pass ✅
   - build succeeds ✅
   - no regressions ✅

3. **Contract**
   - only Allowed Files ✅
   - not Out of Scope ✅
   - acceptance criteria met ✅

4. **API (if applicable)**
   - endpoints work ✅
   - request/response match ✅
   - no breaking changes ✅

5. **Database (if applicable)**
   - schema valid ✅
   - migrations ready ✅
   - no data loss ✅

**Result**:
- ✅ **PASS** → Ready to close
- ❌ **FAIL** → Issues to fix

**Example Output**:
```md
## Evaluation Results

### Code Quality
✅ Lint: PASS
✅ TypeScript: PASS
✅ No secrets: PASS

### Tests
✅ Unit tests: 15 passed
✅ Integration: 8 passed
✅ Build: SUCCESS

### Contract
✅ Allowed Files: Only modified expected files
✅ Out of Scope: Not touched app_user
✅ Acceptance criteria: All met

## Status: ✅ PASS
Ready to close task.
```
