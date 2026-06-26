# Contract

**Task ID**: T-0046
**Phase**: Contracting
**Created**: 2026-06-26
**Approved**: [ ] Yes / [ ] No

---

## Scope

### In Scope

- Thiết kế lại `IAppColor` theo hướng **semantic** (primary/background/text/border/state/button/input/navigation/card/trip/map) dựa trên bộ màu Mai Linh user cung cấp.
- Tạo palette Mai Linh (một theme sáng duy nhất) làm nguồn sự thật.
- ThemeProvider: cả Light & Default mode trỏ cùng palette Mai Linh; giữ API `changeTheme`.
- Migrate **mọi consumer** đang dùng token cũ (`primary[500]`, `neutral[900]`, `textColor.*`, `bg.*`, `stroke`...) sang token semantic mới.
- Khử hardcode màu ở `app/onboarding/*` (palette đỏ → token Mai Linh) và các điểm rò rỉ (`AppText` 'black', `TooltipModal` bug).
- Sửa bug `TooltipModal` ` `${theme.color.bg}90` `.

### Out of Scope

- Thêm dark mode thật (chỉ một theme sáng lần này).
- Đổi màu trong file SVG asset (vd `ic_arrowLeft` của BackButton) — màu nằm trong asset, không trong code.
- `FPSCounter` (debug overlay `rgba(0,0,0,0.7)`) — giữ nguyên, là debug tool, ngoại lệ hợp lệ.
- Thay đổi layout/spacing/font — chỉ đụng màu.
- Backend, app_taixe.

---

## Allowed Files

```
app_user/src/theme/**
app_user/src/components/**
app_user/app/onboarding/**
app_user/app/(tabs)/**
app_user/app/SigninStack/**
app_user/app/DetailToDoScreen.tsx
app_user/app/index.tsx
app_user/CLAUDE.md           # cập nhật doc theme nếu cần
.harness/tasks/T-0046/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

**Rationale**: Theme là cross-cutting; mọi file render màu đều có thể phải migrate token. Giới hạn trong app_user.

---

## Impacted Projects

- [ ] app_taixe
- [x] app_user
- [ ] nestjs_prisma
- [ ] docs
- [x] harness

---

## Acceptance Criteria

- [ ] `IAppColor` semantic hoàn chỉnh, có typing đầy đủ
- [ ] Palette Mai Linh đúng giá trị user cung cấp
- [ ] Mọi consumer migrate sang token mới — `npx tsc --noEmit` 0 lỗi
- [ ] Hết hardcode đỏ ở onboarding; hardcode còn lại chỉ là ngoại lệ đã ghi trong handoff
- [ ] `bun lint` sạch
- [ ] Không hardcode secrets
- [ ] App run được, UI theo quy tắc mix màu (xanh đậm vùng lớn, greenAction CTA, vàng tiết chế, đỏ chỉ cho lỗi/hủy)
- [ ] Tất cả thay đổi trong Allowed Files

---

## Design Decisions (chốt với user)

1. **Phạm vi**: Toàn app (không chỉ onboarding).
2. **Light/Dark**: Một theme sáng Mai Linh duy nhất; cả 2 mode trỏ cùng palette.
3. **Cấu trúc**: Chuyển hẳn semantic — bỏ thang số `primary[0..900]`/`neutral[0..900]`.

### Quy tắc dùng màu (từ user, đưa vào convention)

- Xanh đậm `#006B39`: vùng lớn (header, modal title bar, bottom active bg).
- Xanh action `#00843D`: CTA chính.
- Xanh brand `#009344`: nhận diện, icon, marker, chấm trạng thái — hạn chế cho text nhỏ trên nền trắng.
- Vàng `#FEF100`: rất tiết chế — giá tiền, khuyến mãi, badge ưu đãi, rating, "đặt xe nhanh". Không làm nền form lớn.
- Đỏ `#EB1E27`: chỉ lỗi/hủy/cảnh báo nghiêm trọng.
- Text: ưu tiên đen/trắng; màu khác chỉ trường hợp đặc biệt.
- **Hạn chế tối đa hardcode** — chỉ dùng cho phần tử đặc biệt, không tái sử dụng, không cấn khi phát sinh theme mới.

---

## Test Strategy

- **Type check**: `npx tsc --noEmit` — cổng chính.
- **Lint**: `bun lint`.
- **Manual**: onboarding flow, home, signin/signup, detail todo, bottom sheet, tooltip.
- **Grep**: xác nhận hardcode còn lại chỉ là ngoại lệ.

---

## Sign-off

- **Planner**: Claude (harness)
- **Approved**: [ ] Yes / [ ] No
- **Approved At**: -
