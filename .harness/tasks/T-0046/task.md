# T-0046: Mai Linh Theme System & App-wide Color Refactor

**Title**: Tạo bộ theme Mai Linh (xanh lá) semantic và áp dụng toàn app_user
**Priority**: P0
**Projects**: app_user

---

## Requirement

Tạo bộ theme phù hợp nhận diện thương hiệu **Mai Linh Taxi** (tông xanh lá) và áp dụng đồng bộ toàn app_user. Loại bỏ màu hardcode, chuyển mọi nơi sang dùng semantic tokens.

Bộ màu khuyến dùng (do user cung cấp) — semantic groups:
`primary, background, text, border, state, button, input, navigation, card, trip, map`.

## Quyết định (user, 2026-06-26)

1. **Scope**: Toàn app — refactor mọi nơi chạm màu (onboarding, (tabs), SigninStack, DetailToDo, shared components).
2. **Theme mode**: Một theme sáng Mai Linh duy nhất. Default và Light đều trỏ về cùng palette. Dark mode để sau.
3. **Token API**: Chuyển hẳn sang cấu trúc semantic (colors.button, colors.text, colors.state...). Bỏ thang số `primary[500]`/`neutral[900]`.

## Quy tắc mix màu (bắt buộc tuân theo)

- Xanh đậm `#006B39`: vùng lớn (header, bottom active bg, modal title bar).
- Xanh action `#00843D`: CTA chính.
- Xanh brand `#009344`: nhận diện, icon, marker, chấm trạng thái — không lạm dụng cho text nhỏ.
- Vàng `#FEF100`: rất tiết chế — giá tiền, khuyến mãi, badge ưu đãi, rating, "đặt xe nhanh". Không làm nền form lớn.
- Đỏ `#EB1E27`: chỉ lỗi/hủy/cảnh báo nghiêm trọng.
- Text ưu tiên đen/trắng; màu khác chỉ dùng cho trường hợp đặc biệt.

## Quy tắc hardcode

Hạn chế tối đa màu hardcode. Chỉ chấp nhận hardcode cho phần tử đặc biệt, không tái sử dụng, và phải an toàn khi phát sinh theme mới (không bị "cấn").

## Success Criteria

- [ ] Bộ theme Mai Linh semantic đầy đủ trong `src/theme`
- [ ] `IAppColor` phản ánh cấu trúc semantic; ThemeProvider trỏ về palette Mai Linh
- [ ] Shared components dùng token mới (AppButton, AppText, AppTextInput, CustomHeader, CustomTabBar, BottomSheet...)
- [ ] Các màn onboarding, (tabs), SigninStack, DetailToDo hết hardcode đỏ, dùng token
- [ ] Không còn màu hardcode trừ ngoại lệ đặc biệt được ghi rõ
- [ ] No lint/type errors; app build/run được
- [ ] UI hài hòa theo quy tắc mix màu

---

**Created**: 2026-06-26
**Phase**: Planning
**Status**: Planning
