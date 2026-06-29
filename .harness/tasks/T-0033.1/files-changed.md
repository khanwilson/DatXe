# Files Changed

**Task ID**: T-0033.1

---

## New

- `app_user/src/utils/phone.ts` — phone helpers (flag, name, list, sanitize, normalizeAndValidate).
- `app_user/src/utils/countryNames.ts` — auto-generated CLDR-based `COUNTRY_NAMES` map (en+vi, 245 entries) with manual overrides; replaces Intl.DisplayNames.
- `app_user/src/components/input/PhoneInput.tsx` — reusable phone input (country button + digit field).
- `app_user/src/components/input/CountryPickerModal.tsx` — 75% modal picker with sticky search.

## Modified

- `app_user/package.json` — `+ libphonenumber-js ^1.13.7`.
- `app_user/bun.lock` — lockfile updated by install.
- `app_user/app/SigninStack/SigninScreen.tsx` — integrated `PhoneInput`, E.164 output to OTP flow.
- `app_user/src/localization/iLocalization.ts` — `countryPicker*` keys.
- `app_user/src/localization/resources/en.ts` — English strings.
- `app_user/src/localization/resources/vi.ts` — Vietnamese strings.

## Temp (to remove manually)

- `app_user/phone_check.mjs` — verification script; `rm` blocked by permission mode, needs manual deletion.

All within the contract's Allowed Files.
