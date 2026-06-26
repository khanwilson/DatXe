# Plan

**Task ID**: T-0046
**Phase**: Planning
**Created**: 2026-06-26

---

## Analysis

### Scope Clarification

- Affected Projects: `app_user`
- Affected Files (3 nhóm):
  1. **Theme core**: `src/theme/colors/IAppColor.ts`, `colors/default.ts`, `colors/light.ts`, `src/theme/index.tsx`
  2. **Shared components**: `AppText`, `AppButton`, `AppTextInput`, `CustomHeader`, `CustomTabBar`, `AppBottomSheet`, `AppPopup`, `TooltipModal`, `ExampleBottomSheet`
  3. **Screens**: `app/onboarding/*` (4 file), `app/(tabs)/HomeScreen`, `app/SigninStack/SigninScreen` + `SignupScreen`, `app/DetailToDoScreen`, `app/index.tsx`
- Estimated Complexity: **High** (breaking change cấu trúc IAppColor + đụng ~20 file)

### Dependencies

- Previous Tasks: T-0032/T-0032.2 (onboarding screens là nơi hardcode nhiều nhất)
- External Dependencies: không thêm package
- Blocked By: none

### Risks

- **R1 — Breaking IAppColor**: bỏ thang số `primary[500]`/`neutral[900]` sẽ vỡ mọi consumer hiện tại. → Mitigation: refactor đồng loạt mọi consumer trong cùng task; map từng key cũ → token semantic mới (bảng mapping ở Step 4). Chạy `tsc` để bắt sót.
- **R2 — AppText hardcode 'black'**: text default toàn app. → đổi sang `colors.text.primary`.
- **R3 — TooltipModal bug** `${theme.color.bg}90` (bg là object). → sửa sang overlay token hợp lệ.
- **R4 — BackButton icon màu nằm trong SVG asset**: không đổi bằng code. → ghi nhận, ngoài scope code; nếu cần đổi sẽ flag.
- **R5 — Dark mode**: hiện switch theo `ModeTheme`. → cả Default và Light trỏ cùng palette Mai Linh; giữ `changeTheme` API để không vỡ chỗ gọi.
- **R6 — Regression thị giác**: nhiều màn đổi tông đỏ→xanh. → manual review từng màn; giữ semantic đúng (CTA=greenAction, danger=red...).

---

## Implementation Approach

### Step 1: Thiết kế IAppColor mới (semantic)
Định nghĩa interface theo nhóm user cung cấp: `primary, background, text, border, state, button, input, navigation, card, trip, map`. Giữ tên nhóm `navigation` (đã có) nhưng đổi cấu trúc con sang semantic Mai Linh.

### Step 2: Tạo palette Mai Linh
`src/theme/colors/maiLinh.ts` chứa toàn bộ giá trị user cung cấp, typed theo IAppColor mới. `default.ts` + `light.ts` re-export palette Mai Linh (một nguồn sự thật) để không vỡ import trong `index.tsx`.

### Step 3: Cập nhật ThemeProvider
`index.tsx`: cả Light/Default trỏ về Mai Linh. Giữ `changeTheme`. ITheme.color: IAppColor mới.

### Step 4: Refactor shared components (mapping cũ → mới)
| Cũ | Mới (semantic) |
|----|------|
| `primary[500]` (CTA/active) | `button.primaryBg` / `navigation.tabActive` |
| `color.white` | `text.inverse` / `background.surface` |
| `neutral[900]` (bg tối) | `background.app` hoặc `text.primary` tùy ngữ cảnh |
| `neutral[300/400/500]` (disabled/placeholder/inactive) | `state.disabledText` / `input.placeholder` / `navigation.tabInactive` |
| `textColor.primary` | `text.primary` |
| `textColor.subText` | `text.secondary` |
| `bg.white` / `bg.shuttle` | `background.surface` / `background.app` |
| `stroke` | `border.default` |

Components: AppText, AppButton (primary/disabled), AppTextInput (border/focus/placeholder), CustomHeader (headerBg/headerText), CustomTabBar (tabActive/Inactive/bg/border), AppBottomSheet (surface/handle), TooltipModal (overlay), ExampleBottomSheet.

### Step 5: Refactor screens
- **onboarding/** (4 file): bỏ toàn bộ hardcode đỏ `#E63946`/`#1A1A1A`/`#666666`... → token. Đây là khối lớn nhất. Lưu ý onboarding splash/get-started hiện nền đỏ — chuyển sang nền xanh thương hiệu (`navigation.headerBg`/`primary.greenDark`) hoặc nền sáng theo design; CTA dùng `button.primaryBg`.
- **(tabs)/HomeScreen, SigninStack, DetailToDo, index.tsx**: đổi token cũ → token mới theo mapping.

### Step 6: Verify
`npx tsc --noEmit` (phải 0 lỗi), `bun lint`. Grep lại hardcode để xác nhận chỉ còn ngoại lệ hợp lệ.

---

## Testing Strategy

- Unit tests: project không có runner → skip, log rõ.
- Type safety: `tsc --noEmit` là cổng chính bắt mọi consumer chưa update.
- Manual: review từng màn (onboarding flow, home, signin/signup, detail todo) — đúng tông xanh, CTA nổi, danger đỏ, text đen/trắng.
- Edge: disabled button, input focus/error, tab active/inactive, bottom sheet.

---

## Estimated Effort

- Planning/Contracting: 45 min
- Implementation: 2.5–3 giờ
- Verify + manual review: 45 min
- Total: ~4 giờ

---

## Acceptance Criteria

- [ ] IAppColor semantic + palette Mai Linh hoàn chỉnh
- [ ] Mọi consumer cũ đã migrate sang token mới (tsc 0 lỗi)
- [ ] Hết hardcode đỏ ở onboarding; hết hardcode trừ ngoại lệ ghi rõ
- [ ] Lint sạch
- [ ] App run được, UI hài hòa theo quy tắc mix màu
