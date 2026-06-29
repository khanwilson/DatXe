# Handoff

**Task ID**: T-0033.1
**Title**: PhoneInput component + libphonenumber-js validation (app_user)
**Status**: Done
**Date**: 2026-06-29

---

## Summary

Built a reusable `PhoneInput` for app_user: a country picker button + digits-only field,
backed by `libphonenumber-js` for country-aware validation and E.164 normalization.
Integrated into `SigninScreen`, replacing the previous hardcoded `+84` + regex block.

## Lessons Learned

- `libphonenumber-js` `parsePhoneNumberFromString(input, iso2)` already tolerates the common
  VN input variants (trunk-0, no-0, repeated calling code, full international) — no custom
  dedupe/strip logic needed beyond trimming non-digits. Keep the util thin.
- `Intl.DisplayNames` works on current Hermes; the try/catch fallback to ISO code remains as
  a safety net for older runtimes.
- A plain RN `Modal` + `FlatList` is sufficient for the 75% picker and avoids wrapping the
  signin stack in a `BottomSheetModalProvider`.

## Decisions

- **D1**: Validation/normalization centralized in `src/utils/phone.ts`; components stay presentational.
- **D2**: Country picker uses RN `Modal` (not `@gorhom/bottom-sheet`) — simpler, no provider dependency.
- **D3**: Output contract for any phone field is E.164 string + validity; consumers gate on `valid`.

## API Changes

None (no backend). Frontend OTP request still sends `{ phone }`, now always E.164 (`+84...`).

## Prisma Changes

None.

## Dependency Changes

- `+ libphonenumber-js ^1.13.7` (app_user) — pure JS, Expo-managed safe.

## Reuse

- `PhoneInput` + `src/utils/phone.ts` are ready for reuse in app_taixe login (T-0040).

## Follow-ups

- Remove temp file `app_user/phone_check.mjs` (manual `rm` — was blocked by permission mode).
- Optional: live AsYouType formatting (explicitly out of scope here).
