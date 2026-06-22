# DatXe Project Index

**Last Updated**: 2026-06-22  
**Harness Version**: 1.0  
**Status**: ✅ Ready for use

---

## 📌 Start Here

1. **First Time?** → Read `.harness/tutorial/QUICK_START.md` (5 min)
2. **Want Details?** → Read `.harness/tutorial/SETUP_REPORT.md` (30 min)
3. **Need Rules?** → Read `CLAUDE.md`
4. **Ready to Code?** → Run `/harness <task-description>`

---

## 📚 Documentation Map

### Quick References
| File | Purpose | Read Time |
|------|---------|-----------|
| `.harness/tutorial/QUICK_START.md` | Start here - quick commands | 5 min |
| `.claude/commands/README.md` | All commands & workflow | 10 min |
| `CLAUDE.md` | Project rules & guardrails | 15 min |

### Detailed Guides
| File | Purpose | Read Time |
|------|---------|-----------|
| `.harness/tutorial/SETUP_REPORT.md` | Full setup documentation | 30 min |
| `.harness/PROJECT_STATE.md` | Architecture & decisions | 20 min |
| `.harness/DECISIONS.md` | Long-term decisions | 10 min |

### Command Reference
| Command File | Triggers | Purpose |
|--------------|----------|---------|
| `.claude/commands/harness.md` | `/harness <task>` | Full workflow |
| `.claude/commands/new-task.md` | `/new-task <task>` | Create task |
| `.claude/commands/planner.md` | `/planner T-XXXX` | Planning phase |
| `.claude/commands/contract.md` | `/contract T-XXXX` | Contract definition |
| `.claude/commands/generator.md` | `/generator T-XXXX` | Implementation |
| `.claude/commands/evaluator.md` | `/evaluator T-XXXX` | Testing & validation |
| `.claude/commands/close-task.md` | `/close-task T-XXXX` | Task completion |
| `.claude/commands/resume-task.md` | `/resume-task T-XXXX` | Resume tasks |
| `.claude/commands/task-status.md` | `/task-status T-XXXX` | View status |

---

## 🎯 Quick Commands

### Create & Run Task
```bash
/harness Add driver profile management to app_taixe and backend
```

### Manual Workflow
```bash
/new-task My task description           # Create task folder
/planner T-0001                         # Create plan
/contract T-0001                        # Define scope
/generator T-0001                       # Implement
/evaluator T-0001                       # Test & validate
/close-task T-0001                      # Finalize
```

### Resume & Monitor
```bash
/resume-task T-0001                     # Continue from current phase
/task-status T-0001                     # View progress
```

---

## 📁 Project Structure

```
hethong/
├── 📄 INDEX.md                          ← You are here
├── 📄 README.md                         Main entry point
├── 📄 CLAUDE.md                         Rules & conventions
│
├── 🔧 .claude/
│   ├── settings.json                    Security & permissions
│   └── commands/
│       ├── README.md                    Command reference
│       ├── harness.md
│       ├── new-task.md
│       ├── planner.md
│       ├── contract.md
│       ├── generator.md
│       ├── evaluator.md
│       ├── close-task.md
│       ├── resume-task.md
│       └── task-status.md
│
├── 📊 .harness/
│   ├── PROJECT_STATE.md                 Architecture & state
│   ├── DECISIONS.md                     Long-term decisions
│   ├── TASKS.md                         Task registry
│   ├── CURRENT_TASK.md                  Active task
│   ├── templates/                       (9 template files)
│   ├── scripts/                         Automation scripts (5 files)
│   ├── tutorial/
│   │   ├── QUICK_START.md               Quick reference (5 min)
│   │   └── SETUP_REPORT.md              Full documentation (30 min)
│   └── tasks/                           Task folders (T-XXXX-*)
│
└── 🚀 Projects
    ├── app_taixe/                       Driver mobile app
    ├── app_user/                        Customer mobile app
    └── nestjs_prisma/                   Backend API
```

---

## 🚀 Typical Workflow

### Scenario 1: Full Automated Workflow

```bash
$ /harness Add authentication system with JWT tokens

✅ Task T-0001 created
✅ Planning... (analyzes requirements, creates plan.md)
✅ Contracting... (defines scope, allowed files)
✅ Generating... (implements per contract)
✅ Evaluating... (runs lint, test, build)

Result: PASS ✅
✅ Closing... (creates handoff.md, updates PROJECT_STATE.md)
✅ Task T-0001 complete!

Next: /harness Next task description
```

### Scenario 2: Manual Step-by-Step

```bash
$ /new-task Implement user registration
📁 Task T-0001 created in .harness/tasks/T-0001-implement-user-registration/

$ /planner T-0001
📋 Plan created: plan.md
[Review plan]

$ /contract T-0001
📋 Contract created: contract.md
[Review Allowed Files & Out of Scope]

$ /generator T-0001
🔨 Implementation complete: implementation.md
[Review changes]

$ /evaluator T-0001
✅ All checks passed: evaluation.md PASS

$ /close-task T-0001
✅ Task closed: handoff.md created
✅ PROJECT_STATE.md updated
```

### Scenario 3: Resume Interrupted Task

```bash
$ /resume-task T-0001
📂 Reading task: T-0001
Status: Evaluating
Issues found: lint errors

[Fix issues]

$ /evaluator T-0001
✅ All checks passed now

$ /close-task T-0001
✅ Task T-0001 complete
```

---

## 🔒 Critical Safety Features

### Contract Enforcement
- **Allowed Files** - Defines files that CAN be modified
- **Out of Scope** - Defines projects/files that are PROTECTED
- ❌ Implementation **STOPS** if tries to exceed contract
- ✅ Requires user approval for out-of-scope changes

### Quality Gates
- ✅ Lint validation
- ✅ TypeScript type checking
- ✅ Unit tests
- ✅ Build verification
- ✅ No hard-coded secrets
- ✅ Convention compliance

### Git Safety
- ✅ No automatic `git push`
- ✅ No destructive git operations
- ✅ All changes remain local

---

## 🎯 Task Lifecycle

Each task goes through 8 phases:

```
1. Created        → Task folder initialized
   ↓
2. Planning       → Analyze requirements, create plan
   ↓
3. Contracting    → Define scope & acceptance criteria
   ↓
4. Generating     → Implement per contract
   ↓
5. Evaluating     → Tests, lint, build checks
   ↓
   PASS?
   ├─ NO → 6. Fixing (resolve issues, re-evaluate)
   └─ YES → 7. Closing
   ↓
7. Closing        → Finalize handoff, update state
   ↓
8. Done           → Task complete
```

---

## 📊 Files & Folders Overview

### Configuration & Rules
- `CLAUDE.md` - Project conventions, guardrails, rules
- `.claude/settings.json` - Security, permissions, env vars

### Documentation
- `.harness/PROJECT_STATE.md` - Current architecture & state
- `.harness/DECISIONS.md` - Long-term decisions registry
- `.harness/TASKS.md` - Task status & tracking
- `.harness/CURRENT_TASK.md` - Current active task

### Templates
- `.harness/templates/` - 9 task document templates

### Task Folders
- `.harness/tasks/T-XXXX-*/` - Individual task folders

### Scripts
- `.harness/scripts/` - 5 automation scripts

### Commands
- `.claude/commands/` - 10 command documentation files

---

## ✅ What Was Set Up

### Framework
- ✅ Task-based workflow system
- ✅ Contract-driven development
- ✅ Scope enforcement (Allowed Files / Out of Scope)
- ✅ Multi-phase task lifecycle

### Automation
- ✅ Task creation scripts
- ✅ Quality check runners
- ✅ Contract validators
- ✅ Project state tracking

### Safety
- ✅ Git safety guards
- ✅ Source code protection
- ✅ Secret detection
- ✅ Convention enforcement

### Documentation
- ✅ Quick start guide
- ✅ Detailed setup report
- ✅ Command reference
- ✅ Project state tracking

---

## 🚀 Next Steps

### Immediate
1. Read `.harness/tutorial/QUICK_START.md` (5 min)
2. Read `CLAUDE.md` (understand rules)
3. Create first task: `/harness Your task description`

### Soon
- Review `.harness/PROJECT_STATE.md`
- Review `.harness/DECISIONS.md`
- Complete first task lifecycle

### Later
- Review completed task handoffs
- Update `.harness/PROJECT_STATE.md` with lessons learned
- Promote important decisions to `.harness/DECISIONS.md`

---

## ❓ Common Questions

**Q: How do I start a task?**  
A: `/harness Your task description` - full automated workflow

**Q: How do I check what I can modify?**  
A: Read `contract.md` - check `Allowed Files` and `Out of Scope`

**Q: What if I need to modify files outside the contract?**  
A: Implementation stops and asks for approval - you can approve changes

**Q: How do I continue a task I paused?**  
A: `/resume-task T-XXXX` - continues from current phase

**Q: When is it safe to close a task?**  
A: When `evaluation.md` shows PASS and all checks pass

**Q: Where do I find architectural decisions?**  
A: `.harness/DECISIONS.md` - long-term decisions affecting multiple tasks

---

## 📞 Support

- **Commands**: `.claude/commands/README.md`
- **Rules**: `CLAUDE.md`
- **Architecture**: `.harness/PROJECT_STATE.md`
- **Setup Details**: `.harness/tutorial/SETUP_REPORT.md`
- **Quick Ref**: `.harness/tutorial/QUICK_START.md`

---

**Framework Initialized**: 2026-06-22  
**Status**: ✅ Ready to use  
**First Task**: Ready to create

Let's build! 🚀

```bash
/harness Your task description
```
