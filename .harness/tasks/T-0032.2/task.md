# T-0032.2: Permissions Screen - Thực sự yêu cầu quyền (Location & Notifications)

**Title**: Wire real OS permission requests into onboarding Permissions screen
**Priority**: P1
**Projects**: app_user

---

## Requirement

Màn `app_user/app/onboarding/permissions.tsx` hiện chỉ là UI tĩnh: nút "Allow Permissions" chỉ `setTimeout` rồi điều hướng sang get-started, **không thực sự gọi xin quyền** từ hệ điều hành.

Cần wire request quyền thật. Phạm vi quyền hiện tại theo UI: **Location** và **Notifications**.

## Behaviour Changes Needed

- Nút "Allow Permissions" → gọi request quyền thật:
  - Location (foreground) qua `expo-location`
  - Notifications qua `expo-notifications`
- Sau khi user phản hồi (allow/deny) → điều hướng sang `/onboarding/get-started` (không block flow nếu bị từ chối — đây là onboarding, không bắt buộc).
- Nút "Skip for Now" → giữ nguyên, điều hướng sang get-started, không request.
- Xử lý trạng thái loading khi đang chờ permission dialog để tránh double-tap.

## Design Requirements

- Giữ nguyên UI/branding hiện tại (Mai Linh red #E63946, layout, các permission item).
- Không thay đổi navigation flow tổng thể.

## Dependencies

- Depends on: T-0032 (Onboarding screens), T-0032.1
- Cần thêm dependency: `expo-location`, `expo-notifications`
- Cần cấu hình `app.json` plugins + usage description strings (iOS) / permissions (Android)

## Success Criteria

- [ ] Nút Allow gọi request quyền OS thật cho Location + Notifications
- [ ] Flow không bị crash/treo khi user allow hoặc deny
- [ ] Skip vẫn hoạt động, không request
- [ ] app.json cấu hình đúng plugin + usage strings
- [ ] No lint/type errors
- [ ] Giữ branding & UI hiện tại

---

**Created**: 2026-06-26
**Phase**: Planning
**Status**: Planning
