# Implementation

**Task ID**: T-0033.1
**Phase**: Generating → Closing

---

## Changes Made

### 1. Dependency
- Added `libphonenumber-js` `^1.13.7` to `app_user/package.json` (installed, lockfile updated). Pure JS, Expo-managed safe.

### 2. `src/utils/phone.ts` (new)
- `getFlagEmoji(iso2)` — regional-indicator emoji from ISO2 (no asset).
- `getCountryName(iso2, language)` — looks up the pre-generated `COUNTRY_NAMES` map (CLDR-based, en+vi); falls back to ISO code only for unmapped codes. **NOT** `Intl.DisplayNames` (see Fix below).
- `buildCountryList(language)` — maps `getCountries()` → `{ iso2, callingCode, name, flag }`, sorted by localized name.
- `sanitizePhoneInput(raw)` — strips non-digits, preserves a single leading `+`.
- `normalizeAndValidate(raw, iso2)` — sanitizes then `parsePhoneNumberFromString(s, iso2)`; returns `{ valid, e164 }`. libphonenumber-js natively tolerates all 4 VN input styles.

### 3. `src/components/input/CountryPickerModal.tsx` (new)
- RN `Modal` (slide, transparent) + absolute panel at `75%` screen height.
- Sticky title + search box (`AppTextInput`) on top; `FlatList` of countries below.
- `matchesQuery` filters by name, ISO2, and calling code (with/without `+`).
- Each row: flag — name — `+code`; active row highlighted. Theme tokens only.

### 4. `src/components/input/PhoneInput.tsx` (new)
- Controlled `value` (national digits) + `onChange(PhoneInputChange)` exposing `{ valid, e164, national, country }`.
- Country button (flag + `+code` + caret) opens the picker; phone field is digits-only (`sanitizePhoneInput`), `keyboardType="phone-pad"`.
- Re-validates existing number when the country changes. Default country `VN`.
- Follows TSX file order + `stylesSheet(theme)` + `useMemo` pattern.

### 5. `app/SigninStack/SigninScreen.tsx` (integration)
- Replaced the old hardcoded `+84` + regex block with `<PhoneInput>`.
- State holds `national` + `PhoneInputChange`; `handleContinue` gates on `phone.valid`, sends `phone.e164` to `useRequestOtp` and the OtpScreen `phone` param.

### 6. i18n
- Added `countryPickerTitle`, `countryPickerSearch`, `countryPickerEmpty` to `iLocalization.ts`, `en.ts`, `vi.ts`.

---

## Verification

- `npx tsc --noEmit` → 0 errors.
- `bun lint` → 0 errors (2 pre-existing warnings in unrelated `clearCache.ts`).
- Logic check via temp `phone_check.mjs` (removed): 4 VN cases → `+84346686622`; junk chars trimmed; empty/`+`/`12` invalid; US/JP validate.

---

## Fix (2026-06-29) — country names showing as ISO code

**Symptom**: every `CountryItem.name` rendered identical to its `iso2` (e.g. "VN", "US").

**Root cause**: `getCountryName` used `Intl.DisplayNames`. Not a libphonenumber-js
issue — that lib never provides names. Hermes (default Expo JS engine, no
`jsEngine` override, no Intl polyfill in `package.json`) ships without full-ICU,
so `new Intl.DisplayNames(...)` throws → the `catch` returned `iso2` for every
country.

**Resolution** (per user decision: static CLDR map, no runtime Intl, no full-ICU):
- Added `src/utils/countryNames.ts` — auto-generated `COUNTRY_NAMES` map (245
  entries, en+vi) from `i18n-iso-countries` (CLDR) intersected with
  libphonenumber-js supported regions, plus manual short-name overrides
  (US→Mỹ/United States, GB→Anh/United Kingdom, KR→Hàn Quốc, KP, CN, RU, VN).
  `i18n-iso-countries` used only as a one-off generator (temp dir) — **not** added
  as a project dependency.
- Rewrote `getCountryName(iso2, language)` to read the map, ISO fallback only for
  unmapped codes.
- Removed a stray `console.log('item', item)` in `CountryPickerModal.renderItem`
  (would fail the `no-console` ESLint rule).

Re-verified: `tsc` 0 errors, `bun lint` 0 errors; name resolution returns
"Việt Nam"/"Vietnam", "Mỹ"/"United States", etc.
