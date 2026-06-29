# T-0033.1: PhoneInput component + libphonenumber-js validation - app_user

**Title**: Reusable PhoneInput (country dropdown + phone) with libphonenumber-js
**Created**: 2026-06-26
**Priority**: P1
**Projects**: app_user
**Depends On**: T-0033

---

## Requirement

Tạo component `PhoneInput.tsx` tái sử dụng cho mọi trường nhập số điện thoại, validate bằng
`libphonenumber-js` theo quốc gia. Thay block nhập SĐT hiện tại trong `SigninScreen`.

### Cấu trúc component (2 phần)

1. **Country code** — nút mở dropdown (modal) chọn quốc gia:
   - Mỗi item: **cờ — mã quốc gia (+xx) — tên quốc gia**.
   - Danh sách lấy từ `libphonenumber-js` (getCountries + getCountryCallingCode).
   - Modal cao **0.75 màn hình**.
   - Ô **tìm kiếm sticky** trên cùng modal: tìm theo **mã** (+84, 84) và **tên quốc gia**.
2. **Phone number** — input **chỉ nhận số**; ký tự khác bị trim bỏ qua.

### Validation

- Validate theo **quốc gia đang chọn** (dùng `isValidPhoneNumber` / `parsePhoneNumberFromString`).
- Phải cover các cách nhập (ví dụ Việt Nam, country = +84):
  - `+84` + `0346686622` → pass (có leading 0 quốc nội)
  - `+84` + `346686622` → pass (national, bỏ 0)
  - `+84` + `84346686622` → pass (lặp calling code không có +)
  - `+84` + `+84346686622` → pass (người dùng dán cả mã quốc gia)
- Output: trả về số chuẩn hóa **E.164** (vd `+84346686622`) cho consumer.

---

## Context

- T-0033 vừa làm flow Phone+OTP với block nhập SĐT hardcode `+84` + regex `/^0\d{9}$/`.
  Component này tổng quát hoá + validate đa quốc gia, tái dùng cho app_taixe (T-0040) sau.
- `@gorhom/bottom-sheet` đã có sẵn → dùng cho modal dropdown.
- Theme Mai Linh semantic (T-0046) → không hardcode màu.

## Assumptions

- Default country = VN (+84).
- Cờ: emoji flag suy từ ISO2 (regional indicator) — không cần asset, cross-platform.
- Tên quốc gia: `Intl.DisplayNames` theo ngôn ngữ app, fallback ISO code nếu môi trường không hỗ trợ.

## Out of Scope

- Backend, app_taixe (chỉ tạo component; tái dùng để sau).
- Auto-detect country theo SIM/locale (chỉ default VN).
- Mask/format số khi gõ (chỉ trim non-digit; format E.164 ở output).

## Success Criteria

- [ ] `PhoneInput.tsx` tái sử dụng, props rõ ràng (value, onChangeValid, defaultCountry...).
- [ ] Dropdown modal 0.75 màn hình, search sticky, lọc theo mã + tên.
- [ ] Phone input chỉ số.
- [ ] Validate theo quốc gia; 4 case VN ở trên đều pass; output E.164.
- [ ] SigninScreen dùng PhoneInput thay block cũ.
- [ ] `tsc` sạch, `bun lint` sạch, không hardcode màu.

---

**Created**: 2026-06-26
**Phase**: Created
**Status**: Planned
