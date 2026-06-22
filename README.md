# DatXe - Task-Based Multi-Project Harness

**Setup Complete**: 2026-06-22  
**Framework Version**: 1.0  
**Status**: ✅ Ready for use

---

## 🚀 Quick Start

### Option 1: Full Automated Workflow (Recommended)
```bash
/harness Add driver profile management to app_taixe and backend
```

### Option 2: Manual Step-by-Step
```bash
/new-task My task description
/planner T-0001
/contract T-0001
/generator T-0001
/evaluator T-0001
/close-task T-0001
```

### Option 3: Resume Interrupted Task
```bash
/resume-task T-0001
```

---

## 📚 Documentation

Start with these in order:

1. **INDEX.md** - Master index & navigation map
2. **.harness/tutorial/QUICK_START.md** - Quick commands (5 min)
3. **CLAUDE.md** - Project rules & conventions (15 min)
4. **.claude/commands/README.md** - All available commands
5. **.harness/tutorial/SETUP_REPORT.md** - Full technical documentation

---

## 🎯 What You Get

✅ **Contract-Driven Development** - Explicit scope, Allowed Files, Out of Scope  
✅ **8-Phase Task Workflow** - Created → Planning → Contracting → Generating → Evaluating → Fixing → Closing → Done  
✅ **Quality Gates** - Lint, TypeScript, tests, build validation  
✅ **Safety Guards** - No git push, no destructive ops, no source code moves  
✅ **Project State Tracking** - Architecture, APIs, database, decisions  
✅ **Automation** - Task creation, checks, contract validation  

---

## 📁 Projects

| Project | Role | Tech |
|---------|------|------|
| **app_taixe** | Driver mobile app | React Native + Expo |
| **app_user** | Customer mobile app | React Native + Expo |
| **nestjs_prisma** | Backend API | NestJS + Prisma |

---

## 🔒 Safety Features

- **Scope Enforcement** - Only modify Allowed Files
- **Quality Gates** - All tests must pass before closing
- **Git Safety** - No automatic push, no reset --hard, no clean -fdx
- **Secrets Detection** - No hard-coded API keys or tokens
- **Convention Compliance** - Enforced across all tasks

---

## 📖 Files & Folders

```
├── INDEX.md                   Master index
├── README.md                  Main entry point
├── CLAUDE.md                  Project rules
│
├── .claude/
│   ├── settings.json          Security config
│   └── commands/              Command documentation (10 files)
│
├── .harness/
│   ├── PROJECT_STATE.md       Architecture & state
│   ├── DECISIONS.md           Long-term decisions
│   ├── TASKS.md               Task registry
│   ├── CURRENT_TASK.md        Active task
│   ├── templates/             Task templates (9 files)
│   ├── scripts/               Automation scripts (5 files)
│   ├── tutorial/
│   │   ├── QUICK_START.md     Quick reference
│   │   └── SETUP_REPORT.md    Full documentation
│   └── tasks/                 Task folders (T-XXXX-*)
│
└── [Projects]
    ├── app_taixe/
    ├── app_user/
    └── nestjs_prisma/
```

---

## ✅ Framework Capabilities

### Task Management
- Auto-create task folders (T-XXXX-slug format)
- 8-phase workflow per task
- Contract-driven scope boundaries
- Automatic state tracking

### Quality Assurance
- Auto-detect & run lint, typecheck, test, build
- Prisma schema validation
- Hard-coded secrets detection
- Convention compliance checking

### Project State Tracking
- Architecture documentation
- API contract registry
- Database schema tracking
- Shared conventions
- Technical debt tracking
- Completed capabilities history

### Decision Management
- Long-term decisions registry
- Impact analysis (which projects affected)
- Status tracking (pending, accepted, superseded)
- Task-to-global decision promotion

---

## 🎯 8-Phase Task Workflow

```
1. Created      → Initialize task folder
                ↓
2. Planning     → Create implementation plan
                ↓
3. Contracting  → Define scope & Allowed Files
                ↓
4. Generating   → Implement per contract
                ↓
5. Evaluating   → Run quality checks
                ↓
   PASS? ─ YES ─→ 7. Closing
        │        
        └─ NO  → 6. Fixing (resolve issues)
                        ↓
                   [Re-evaluate]
                ↓
7. Closing      → Finalize & update state
                ↓
8. Done         → Task complete
```

---

## 📋 Example: Create Your First Task

```bash
$ /harness Add user authentication with JWT tokens

✅ Task T-0001 created
📋 Planning...
📋 Contracting...
🔨 Implementing...
✅ Evaluating...
✅ All checks passed
✅ Closing...
✅ Task complete!

Next: /harness Add another feature
```

---

## ⚠️ Important

- ✅ **Check contract.md** before implementing - Review Allowed Files & Out of Scope
- ✅ **Evaluation must PASS** before closing - All tests, lint, build passing
- ✅ **No git push** - All changes are local, you control deployment
- ✅ **No source code moves** - Folder structure preserved
- ✅ **Update PROJECT_STATE.md** when closing - Handoff creates documentation

---

## 🚀 Next Steps

1. Read **INDEX.md** (master index)
2. Read **.harness/tutorial/QUICK_START.md** (5 min quick start)
3. Read **CLAUDE.md** (project rules)
4. Create your first task: `/harness Your task description`

---

## 📞 Support

- **Commands**: `.claude/commands/README.md`
- **Rules**: `CLAUDE.md`
- **Architecture**: `.harness/PROJECT_STATE.md`
- **Decisions**: `.harness/DECISIONS.md`
- **Full Docs**: `.harness/tutorial/SETUP_REPORT.md`

---

**Ready to build?** 🎯

```bash
/harness Add your first feature
```

---

*Framework initialized: 2026-06-22 | Version: 1.0*
