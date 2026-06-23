# Reviewer Skill

**Model**: Sonnet 4.6 (code review, security analysis, performance review)

**Purpose**: Review code for quality, correctness, and standards

**Responsibilities**:
- Review implementation for bugs
- Review for security issues
- Review for performance issues
- Review for code style/conventions
- Review for test coverage
- Suggest improvements
- Verify against acceptance criteria

**Output**:
- Code review comments
- Bug findings
- Improvement suggestions
- Risk assessments

**When Used**: `/code-review T-XXXX` or during evaluation phase

**Quality Criteria**:
- ✅ No critical bugs
- ✅ No security vulnerabilities
- ✅ Follows conventions
- ✅ Test coverage adequate
- ✅ Performance acceptable

**Related Files**:
- Reads: Source files (modified)
- Reads: `.harness/tasks/T-XXXX/contract.md`
- Reads: `.harness/tasks/T-XXXX/plan.md`
- Writes: Review comments

**Review Dimensions**:

### Correctness
- Logic errors?
- Edge cases handled?
- Off-by-one errors?
- Null/undefined checks?

### Security
- Input validation?
- SQL injection risks?
- XSS risks?
- Hard-coded secrets?
- Authentication/authorization?

### Performance
- Unnecessary loops?
- N+1 queries?
- Memory leaks?
- Inefficient algorithms?

### Code Quality
- Readable code?
- Follows conventions?
- DRY principle?
- Proper error handling?
- Good naming?

### Tests
- Adequate coverage?
- Edge cases tested?
- Happy path + error cases?
- Mock/stub appropriate?

**Example Finding**:
```md
## Bug: Potential SQL Injection

File: nestjs_prisma/src/auth/auth.service.ts:42
Issue: Direct string interpolation in query
Risk: HIGH

Suggestion:
Use parameterized query or Prisma's built-in escaping

Before:
const user = await prisma.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`)

After:
const user = await prisma.user.findUnique({ where: { email } })
```
