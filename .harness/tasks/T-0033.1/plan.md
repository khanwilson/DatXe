# Plan

**Task ID**: T-0033.1
**Phase**: Planning
**Created**: 2026-06-26

---

## Analysis

### Scope Clarification

- Affected Projects: `app_user`
- Affected Files:
  1. **New component**: `src/components/input/PhoneInput.tsx` + (tách phụ) `CountryPickerModal`.
  2. **Util**: `src/utils/phone.ts` — helpers chuẩn hoá/validate dùng libphonenumber-js.
  3. **Consumer**: `app/SigninStack/SigninScreen.tsx` — thay block nhập SĐT.
  4. **Deps**: `package.json` (+ `libphonenumber-js`).
  5. **i18n**: thêm key search placeholder / chọn quốc gia (optional).
- Estimated Complexity: **Medium-High** (lib mới + modal có search + chuẩn hoá nhiều case nhập).

### Dependencies

- Previous Tasks: T-0033 (flow OTP, consumer), T-0046 (theme token).
- External: **libphonenumber-js** (mới). `@gorhom/bottom-sheet` (đã có).
- Blocked By: none.

### Risks

- **R1 — Chuẩn hoá đầu vào đa dạng** (`0346…`, `346…`, `84346…`, `+84346…`):
  parse trực tiếp dễ sai. → Mitigation: thuật toán chuẩn hoá 2 bước (xem Step 2): thử E.164 trước,
  rồi thử ghép quốc gia, dedupe calling code lặp, strip leading 0.
- **R2 — Intl.DisplayNames không có trên Hermes cũ**: tên nước rỗng. → fallback ISO code, try/catch.
- **R3 — Emoji flag không render trên 1 số Android**: chấp nhận (text mã nước vẫn rõ); không block.
- **R4 — Danh sách ~250 nước render lag**: → dùng `BottomSheetFlatList`, memo item, search lọc.
- **R5 — Đổi public API nhập SĐT của SigninScreen**: → giữ output là E.164 string; cập nhật handler.
- **R6 — Thêm dependency**: ghi rõ trong contract & handoff; pin version.

---

## Implementation Approach

### Step 1: Cài libphonenumber-js
`bun add libphonenumber-js` (pin version trong package.json). Lib có sẵn metadata + flag-less data:
`getCountries()`, `getCountryCallingCode(cc)`, `parsePhoneNumberFromString`, `isValidPhoneNumber`,
`AsYouType` (không bắt buộc).

### Step 2: util `src/utils/phone.ts`
- `getCountryName(iso2, lang)` — `Intl.DisplayNames` try/catch → fallback iso2.
- `getFlagEmoji(iso2)` — regional indicator từ 2 ký tự ISO.
- `buildCountryList()` — map getCountries() → `{ iso2, callingCode, name, flag }`, sort theo tên.
- `normalizeAndValidate(rawNational, iso2)` — lõi xử lý các case:
  1. Trim non-digit (giữ `+` đầu nếu có) khỏi input.
  2. Nếu bắt đầu `+`: parse thẳng E.164.
  3. Ngược lại: bỏ các leading `0`; nếu chuỗi bắt đầu bằng callingCode của nước đang chọn
     (vd `84…`) thì bỏ phần lặp; ghép `+<callingCode><national>`.
  4. `parsePhoneNumberFromString(candidate, iso2)` → nếu `.isValid()` trả `{ valid, e164 }`.
  → Cover được `0346…`, `346…`, `84346…`, `+84346…`.

### Step 3: CountryPickerModal
- Dùng `@gorhom/bottom-sheet` `BottomSheetModal` snapPoints `['75%']`.
- Header sticky: `AppTextInput` search (lọc theo `name` lowercase + `callingCode`/`+code` + iso2).
- `BottomSheetFlatList` item: `flag  name  +code`, chọn → set country + đóng.
- Theme token, AppText.

### Step 4: PhoneInput.tsx
- Props: `value?` (E.164), `defaultCountry='VN'`, `onChangeText(national)`, `onChangeValidity({valid,e164,country})`, `placeholder`, `autoFocus`.
- Layout: nút countryCode (flag + +code, mở modal) | TextInput số (chỉ digit, `keyboardType=phone-pad`, onChangeText trim non-digit).
- Expose validity ra ngoài để consumer enable/disable nút.
- Tuân thủ TSX file order + StyleSheet pattern (`stylesSheet(theme)` + useMemo).

### Step 5: Tích hợp SigninScreen
- Thay `phoneRow/prefixBox/AppTextInput` bằng `<PhoneInput>`.
- State giữ `{ national, valid, e164 }`; `handleContinue` dùng `e164` (hoặc national theo backend).
  Giữ truyền `phone` param sang OtpScreen ở dạng E.164.
- Bỏ `VN_PHONE_REGEX` local (đã chuyển vào util/lib).

### Step 6: Verify
`npx tsc --noEmit`, `bun lint`, grep hardcode màu. Unit-check logic chuẩn hoá bằng 1 script tạm
(hoặc reasoning) cho 4 case VN + vài nước khác (US, JP).

---

## Testing Strategy

- Unit: project chưa có runner → viết script kiểm chứng tạm cho `normalizeAndValidate` rồi xoá,
  hoặc log rõ skip. Cover 4 case VN + 1-2 nước khác + case invalid.
- Type-check: cổng chính.
- Manual: mở dropdown (cao 75%, search theo tên/mã), chọn nước, nhập số có ký tự lạ (bị trim),
  validate đúng/sai, đi tiếp flow OTP.
- Edge: input rỗng, chỉ `+`, số quá dài/ngắn, đổi nước sau khi đã nhập.

---

## Estimated Effort

- Planning/Contracting: 30 min
- Implementation: 2.5–3 giờ
- Verify: 40 min
- Total: ~4 giờ

---

## Acceptance Criteria

- [ ] libphonenumber-js cài + pin version
- [ ] util phone (flag, name, list, normalizeAndValidate) cover 4 case VN
- [ ] CountryPickerModal 75% + search sticky lọc theo mã & tên
- [ ] PhoneInput chỉ nhận số, trả E.164 + validity
- [ ] SigninScreen dùng PhoneInput, flow OTP vẫn chạy
- [ ] tsc + lint sạch, không hardcode màu
