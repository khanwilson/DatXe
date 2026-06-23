# Generator

Implement task according to contract.

**Model**: Sonnet 4.6 (thinking task — requires code implementation, logic, architecture decisions)

## Usage

```
/generator T-XXXX
```

## Example

```
/generator T-0001
```

## What It Does

1. Reads contract from `contract.md`
2. Reads plan from `plan.md`
3. Implements according to contract:
   - Only modifies `Allowed Files`
   - Respects `Out of Scope`
   - Follows acceptance criteria
4. Documents changes in `implementation.md`
5. Tracks file changes in `files-changed.md`
6. Records decisions in `decisions.md`

## Safety

- ❌ Will **NOT** modify files outside `Allowed Files`
- ❌ Will **NOT** touch `Out of Scope` projects
- ✅ Will **STOP** and ask if needs to exceed contract

## Output

- `implementation.md` - What was implemented
- `files-changed.md` - File-level changes
- `decisions.md` - Implementation decisions
- Modified source files (per contract)

## Next

After implementation, run `/evaluator T-XXXX` to test.

