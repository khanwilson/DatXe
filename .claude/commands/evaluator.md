# Evaluator

Run checks and validation for task implementation.

**Model**: Sonnet 4.6 (thinking task — requires QA analysis, contract compliance, test verification)

## Usage

```
/evaluator T-XXXX
```

## Example

```
/evaluator T-0001
```

## What It Does

1. Runs project checks:
   - `npm run lint` (if exists)
   - `npm run typecheck` (if exists)
   - `npm run test` (if exists)
   - `npm run build` (if exists)
2. Verifies contract compliance:
   - ✅ Only modified `Allowed Files`
   - ✅ Didn't touch `Out of Scope` projects
   - ✅ API contracts match
   - ✅ Database/Prisma changes valid
   - ✅ No hard-coded secrets
3. Verifies acceptance criteria
4. Documents results in `evaluation.md`

## Checks

- **Code Quality**: lint, typecheck, no secrets
- **Tests**: unit, integration, build
- **Scope Compliance**: files modified are within allowed set
- **API Contracts**: frontend calls match backend
- **Database**: Prisma schema valid, migrations ready

## Results

If **PASS**:
- Ready for `/close-task`

If **FAIL**:
- Issues documented in `evaluation.md`
- Resume with `/resume-task T-XXXX` to fix

