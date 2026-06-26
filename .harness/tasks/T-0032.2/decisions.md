# Decisions (Task-scoped)

**Task ID**: T-0032.2

---

## D1: Onboarding chỉ xin quyền tối thiểu để đặt xe

**Decision**: Màn onboarding permissions chỉ request **Location (foreground)** + **Notifications**.

**Context**: Đây là một trong những màn đầu khi mở app. Chỉ cần đủ quyền để đặt được xe.

**Rationale**: Xin quá nhiều quyền sớm làm giảm tỉ lệ đồng ý. Các quyền khác xin theo ngữ cảnh tại đúng màn dùng:
- Contacts → màn liên hệ (sau)
- Camera / Photo Library → màn đổi profile (sau)

**Source**: nathan, 2026-06-26.

---

## D2: Onboarding permission là non-blocking

**Decision**: Allow hay deny đều điều hướng tiếp sang get-started; không gate flow.

**Rationale**: Không chặn user vào app vì từ chối quyền ở bước onboarding. Khi cần thực sự (đặt xe) sẽ kiểm tra/nhắc lại quyền tại điểm sử dụng.

---

## D3: Location dùng foreground, không background

**Decision**: Chỉ `requestForegroundPermissionsAsync()`.

**Rationale**: app_user (khách) chỉ cần vị trí khi đang dùng app để tìm/đón xe. Background location là nhu cầu của app_taixe (tài xế), không thuộc task này.
