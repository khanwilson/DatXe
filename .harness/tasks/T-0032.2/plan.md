# Plan

**Task ID**: T-0032.2
**Phase**: Planning
**Created**: 2026-06-26

---

## Analysis

### Scope Clarification

- Affected Projects: `app_user`
- Affected Files:
  - `app_user/app/onboarding/permissions.tsx` (logic request quyền)
  - `app_user/app.json` (plugins + usage descriptions)
  - `app_user/package.json` (thêm `expo-location`, `expo-notifications`)
- Estimated Complexity: Low–Medium

### Dependencies

- Previous Tasks: T-0032, T-0032.1
- External Dependencies:
  - `expo-location` — request foreground location permission
  - `expo-notifications` — request notifications permission
- Blocked By: none

### Risks

- **Risk 1**: Permission API khác nhau iOS/Android, deny không nên block onboarding → Mitigation: luôn điều hướng tiếp dù allow/deny, không gate.
- **Risk 2**: Thiếu usage description string sẽ crash trên iOS khi request → Mitigation: cấu hình `app.json` plugin + `NSLocationWhenInUseUsageDescription` trước khi test.
- **Risk 3**: Double-tap mở nhiều dialog → Mitigation: state `isRequesting` để disable nút khi đang chờ.
- **Risk 4**: Version mismatch với Expo SDK 54 → Mitigation: cài bằng `npx expo install` để Expo chọn version tương thích.

---

## Implementation Approach

### Step 1: Cài đặt dependencies
`npx expo install expo-location expo-notifications` — để Expo pin version khớp SDK ~54.

### Step 2: Cấu hình app.json
- Thêm `expo-location` plugin với `locationWhenInUsePermission` message (tiếng Việt, branding Mai Linh).
- Thêm `expo-notifications` plugin (nếu cần icon/màu mặc định để trống).
- Đảm bảo iOS `infoPlist` có usage description tương ứng (qua plugin).

### Step 3: Wire request logic trong permissions.tsx
- `handleRequestAllPermissions` thành async:
  - `await Location.requestForegroundPermissionsAsync()`
  - `await Notifications.requestPermissionsAsync()`
  - bọc try/catch, log `console.warn` khi lỗi (console.log bị cấm).
  - sau cùng `router.push('/onboarding/get-started')` bất kể kết quả.
- Thêm state `isRequesting` → disable cả 2 nút khi đang chờ, tránh double request.
- Giữ nguyên UI, chỉ đổi handler + thêm trạng thái nút.

### Step 4: Verify
- `bun lint` + `npx tsc --noEmit` chỉ với file thay đổi.

---

## Testing Strategy

- Unit tests: không có test runner trong project → skip, log rõ.
- Manual testing: chạy app, tap Allow → thấy 2 dialog OS lần lượt; allow/deny đều điều hướng sang get-started; Skip không hiện dialog.
- Edge cases: deny cả 2, double-tap nút Allow, quyền đã granted từ trước (request trả về ngay).

---

## Estimated Effort

- Planning: 20 min
- Implementation: 30 min
- Testing: 15 min
- Total: ~1 giờ

---

## Acceptance Criteria

- [ ] Nút Allow request quyền OS thật (Location foreground + Notifications)
- [ ] Flow điều hướng đúng dù allow/deny
- [ ] Skip không request, vẫn điều hướng
- [ ] app.json + dependencies cấu hình đúng (Expo-pinned versions)
- [ ] No lint/type errors
- [ ] Giữ branding & UI hiện tại
