# Contract

**Task ID**: T-0033.1
**Phase**: Contracting
**Created**: 2026-06-26
**Approved**: [x] Yes / [ ] No  (user: "thêm task xong thì thực thi luôn")

---

## Scope

### In Scope

- Cài **libphonenumber-js** (dependency mới, pin version).
- Tạo util `src/utils/phone.ts`: `getFlagEmoji`, `getCountryName`, `buildCountryList`,
  `normalizeAndValidate` (chuẩn hoá + validate theo quốc gia, output E.164).
- Tạo component `src/components/input/PhoneInput.tsx` (kèm CountryPickerModal):
  - Country code button (cờ + +code) mở modal dropdown.
  - Modal `@gorhom/bottom-sheet` cao **75%**, **search sticky** trên cùng, lọc theo mã & tên nước.
  - Phone input **chỉ nhận số** (trim ký tự khác).
  - Validate theo quốc gia; cover 4 case nhập VN; expose `{ valid, e164, country }`.
- Tích hợp `PhoneInput` vào `app/SigninStack/SigninScreen.tsx` (thay block nhập SĐT cũ).
- i18n: thêm key cho search placeholder / tiêu đề chọn quốc gia (nếu cần).

### Out of Scope

- app_taixe, backend, Prisma.
- Auto-detect country theo SIM/locale (default VN).
- Live formatting/mask khi gõ (chỉ trim; format E.164 ở output).
- Đổi OtpScreen (chỉ nhận `phone` param như cũ, dạng E.164).

---

## Allowed Files

```
app_user/src/components/input/PhoneInput.tsx        # mới
app_user/src/components/input/**                     # nếu tách CountryPickerModal
app_user/src/utils/phone.ts                          # mới
app_user/app/SigninStack/SigninScreen.tsx            # tích hợp
app_user/src/localization/**                         # key mới (nếu cần)
app_user/package.json                                # + libphonenumber-js
app_user/bun.lock                                    # lockfile do bun add cập nhật
.harness/tasks/T-0033.1/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

**Rationale**: Component input + util + 1 consumer. Thêm 1 dependency. Giới hạn trong app_user.

---

## Impacted Projects

- [ ] app_taixe
- [x] app_user
- [ ] nestjs_prisma
- [ ] docs
- [x] harness

---

## Acceptance Criteria

- [ ] libphonenumber-js cài + pin version trong package.json
- [ ] `normalizeAndValidate` cover 4 case VN: `0346686622`, `346686622`, `84346686622`, `+84346686622` (country +84) → đều valid, output `+84346686622`
- [ ] CountryPickerModal cao 75%, search sticky lọc theo **mã** (+84/84) và **tên** quốc gia
- [ ] Phone input chỉ nhận số (ký tự khác bị trim)
- [ ] Mỗi item dropdown: cờ — mã (+xx) — tên quốc gia
- [ ] PhoneInput tái sử dụng, expose validity + E.164
- [ ] SigninScreen dùng PhoneInput; flow OTP vẫn chạy
- [ ] `npx tsc --noEmit` 0 lỗi; `bun lint` sạch
- [ ] Không hardcode màu (theme Mai Linh); không hardcode secrets
- [ ] Tất cả thay đổi trong Allowed Files

---

## Dependency Changes

```
+ libphonenumber-js (^1.x)  — phone parse/validate, country metadata, calling codes
```
Lý do: chuẩn hoá & validate SĐT đa quốc gia đáng tin cậy hơn regex thủ công. Lib phổ biến,
maintained, không native module (pure JS) → an toàn với Expo managed.

---

## Database Impact

Không.

---

## Test Strategy

- **Type check**: `npx tsc --noEmit`.
- **Lint**: `bun lint`.
- **Logic check**: script tạm verify `normalizeAndValidate` cho 4 case VN + US/JP + invalid, rồi xoá.
- **Manual**: dropdown 75% + search, chọn nước, nhập ký tự lạ (bị trim), validate, đi tiếp OTP.
- **Edge**: rỗng, chỉ `+`, quá ngắn/dài, đổi nước sau khi nhập.

---

## Design Decisions (chốt với user)

1. **Lib**: libphonenumber-js cho validate theo quốc gia + metadata.
2. **Cờ**: emoji flag (regional indicator) — không cần asset.
3. **Tên nước**: `Intl.DisplayNames` theo ngôn ngữ app, fallback ISO code.
4. **Output**: E.164 chuẩn (`+84346686622`) cho consumer; cover 4 kiểu nhập.
5. **Modal**: `@gorhom/bottom-sheet` (đã có), snapPoint 75%, search sticky.

---

## Sign-off

- **Planner**: Claude (harness)
- **Approved**: [ ] Yes / [ ] No
- **Approved At**: -
