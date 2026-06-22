# 🚀 Harness Quick Start

## First Task

```bash
/harness Add driver registration flow with app_taixe and backend
```

That's it! Full workflow runs automatically.

## Manual Steps

```bash
/new-task My task
/planner T-0001
/contract T-0001
/generator T-0001
/evaluator T-0001
/close-task T-0001
```

## Resume Interrupted Task

```bash
/resume-task T-0001
```

## View Task Status

```bash
/task-status T-0001
```

---

## Key Files

| File | Purpose |
|------|---------|
| `../../CLAUDE.md` | Rules & conventions |
| `../PROJECT_STATE.md` | Architecture & decisions |
| `../TASKS.md` | Task registry |
| `../../.claude/commands/README.md` | Command reference |

## Contract Safety

Before implementing, check:
- ✅ `Allowed Files` - What CAN be modified
- ✅ `Out of Scope` - What is PROTECTED

If need to modify out-of-scope files → **ASK FIRST**

## Workflow

```
/harness <task>
    ↓
📋 Planner (create plan.md)
    ↓
📋 Contractor (create contract.md with Allowed Files)
    ↓
🔨 Generator (implement per contract)
    ↓
✅ Evaluator (run checks: lint, typecheck, test, build)
    ↓
   PASS? → Close (handoff + update PROJECT_STATE)
   FAIL? → /resume-task (fix issues, re-evaluate)
```

---

## Need Details?

- Full guide: `SETUP_REPORT.md`
- Commands: `../../.claude/commands/README.md`
- Architecture: `../PROJECT_STATE.md`
- Rules: `../../CLAUDE.md`

---

Ready? Let's go! 🎯

```bash
/harness Your task description
```
