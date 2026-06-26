# Files Changed

**Task ID**: T-0032.2
**Phase**: Generating

---

## app_user

| File | Type | Description |
|------|------|-------------|
| `app/onboarding/permissions.tsx` | Modified | Wire real Location + Notifications permission requests; add `isRequesting` state, loading/disabled button states |
| `app.json` | Modified | Add `expo-location` (usage description) + `expo-notifications` plugins |
| `package.json` | Modified | Add `expo-location@~19.0.8`, `expo-notifications@~0.32.17` |
| `bun.lock` | Modified | Lockfile updated by `expo install` |

## .harness

| File | Type | Description |
|------|------|-------------|
| `tasks/T-0032.2/task.md` | Created | Task definition |
| `tasks/T-0032.2/plan.md` | Created | Plan |
| `tasks/T-0032.2/contract.md` | Created | Contract (approved) |
| `tasks/T-0032.2/status.md` | Created | Status tracking |
| `tasks/T-0032.2/implementation.md` | Created | Implementation log |
| `tasks/T-0032.2/files-changed.md` | Created | This file |
| `tasks/T-0032.2/decisions.md` | Created | Task-scoped decisions |
| `TASKS.md` | Modified | Registry index entry for T-0032.2 |

---

## Out of Scope (not touched)

- `app_taixe/**`
- `nestjs_prisma/**`
- Other `app_user` screens
