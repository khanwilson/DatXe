# Contract

**Task ID**: T-0032.2
**Phase**: Contracting
**Created**: 2026-06-26

---

## Scope

### In Scope

- Wire request quyền OS thật trong `permissions.tsx`: Location (foreground) + Notifications
- Thêm dependency `expo-location`, `expo-notifications` (Expo-pinned)
- Cấu hình `app.json`: plugins + usage description strings
- State loading/disable nút khi đang request

### Out of Scope

- Background location, "always" permission
- Push notification token registration / gửi notification thực tế
- Contacts hoặc bất kỳ quyền nào khác ngoài Location + Notifications
- Thay đổi UI/branding/layout của màn
- Thay đổi navigation flow tổng thể
- Wiring quyền cho app_taixe

> **Decision (2026-06-26, nathan)**: Onboarding chỉ xin quyền tối thiểu đủ để đặt xe (Location + Notifications). Các quyền theo ngữ cảnh xin sau tại đúng màn dùng: Contacts ở màn liên hệ, Camera/Photo Library ở màn đổi profile. Không gom hết vào onboarding.

---

## Allowed Files

```
app_user/app/onboarding/permissions.tsx
app_user/app.json
app_user/package.json
app_user/bun.lock
.harness/tasks/T-0032.2/**
.harness/TASKS.md
```

**Rationale**: Task chỉ liên quan màn permissions của app_user. `package.json` + `bun.lock` thay đổi do thêm 2 expo package. Nếu cần đụng file khác sẽ DỪNG và hỏi.

---

## Impacted Projects

- [ ] app_taixe
- [x] app_user
- [ ] nestjs_prisma
- [ ] docs
- [x] harness

---

## Acceptance Criteria

- [ ] Nút Allow request quyền OS thật cho Location foreground + Notifications
- [ ] Allow/deny đều điều hướng sang `/onboarding/get-started`, không crash/treo
- [ ] Skip không request, vẫn điều hướng
- [ ] `app.json` có plugin + usage description (tiếng Việt branding)
- [ ] Dependencies cài bằng `expo install` (version khớp SDK 54)
- [ ] No lint errors: `bun lint`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Không hard-code secrets
- [ ] Theo convention (absolute imports, AppText, English comments)
- [ ] Tất cả thay đổi nằm trong Allowed Files

---

## API Contract Changes

None — không có thay đổi backend.

---

## Database Impact

None — không đụng Prisma.

---

## Test Strategy

- **Unit Tests**: N/A (project không có test runner) → log skipped
- **Manual Testing**: tap Allow → 2 dialog OS; allow/deny → get-started; Skip → không dialog
- **Edge Cases**: deny cả hai, double-tap, quyền đã granted sẵn

---

## Sign-off

- **Planner**: Claude (harness)
- **Code Owner**: nathan
- **Approved**: [x] Yes / [ ] No
- **Approved At**: 2026-06-26
