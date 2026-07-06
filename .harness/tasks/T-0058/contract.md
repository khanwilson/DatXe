# Contract — T-0058

## Scope

Port the phone+OTP signin flow from app_user to app_taixe. Replace the existing email/password mock auth with the same OTP-based flow. No UI redesign — logic and structure identical to app_user, with driver-specific copy adjustments.

## Out of Scope

- app_user (no changes)
- nestjs_prisma (no changes)
- Home screen / tabs / onboarding
- Real backend integration (mock DEV flow only, same as app_user)
- New screens beyond SigninScreen + OtpScreen

## Allowed Files

### New files
- `app_taixe/src/utils/phone.ts`
- `app_taixe/src/utils/countryNames.ts`
- `app_taixe/src/components/input/PhoneInput.tsx`
- `app_taixe/src/components/input/CountryPickerModal.tsx`

### Modified files
- `app_taixe/package.json` — add `libphonenumber-js`
- `app_taixe/src/api/services/authService.ts` — replace email/password with OTP
- `app_taixe/src/api/hooks/useAuth.ts` — replace login/register with requestOtp/verifyOtp
- `app_taixe/src/api/services/index.ts` — re-export updated authService
- `app_taixe/src/api/hooks/index.ts` — re-export updated hooks
- `app_taixe/src/api/index.ts` — re-export
- `app_taixe/app/SigninStack/_layout.tsx` — add OtpScreen, remove SignupScreen
- `app_taixe/app/SigninStack/SigninScreen.tsx` — replace with PhoneInput flow
- `app_taixe/app/SigninStack/OtpScreen.tsx` — new OTP entry screen
- `app_taixe/src/localization/iLocalization.ts` — add auth + country picker keys
- `app_taixe/src/localization/resources/en.ts` — add translations
- `app_taixe/src/localization/resources/vi.ts` — add translations

### Deleted files
- `app_taixe/app/SigninStack/SignupScreen.tsx`

## Acceptance Criteria

- [ ] `libphonenumber-js` in package.json; user runs `bun install`
- [ ] `phone.ts` + `countryNames.ts` utils present in app_taixe
- [ ] `PhoneInput` + `CountryPickerModal` components present
- [ ] `authService` exposes `requestOtp` / `verifyOtp` / `logout` / `refreshToken` (no email/password)
- [ ] `useRequestOtp` + `useVerifyOtp` hooks wired correctly
- [ ] `SigninScreen` uses `PhoneInput`, calls `requestOtp`, navigates to `OtpScreen`
- [ ] `OtpScreen` validates 6-digit code, calls `verifyOtp`, navigates to `/(tabs)/HomeScreen`
- [ ] `_layout.tsx` references `SigninScreen` + `OtpScreen` (not `SignupScreen`)
- [ ] `SignupScreen.tsx` deleted
- [ ] All new localization keys present in `iLocalization.ts`, `en.ts`, `vi.ts`
- [ ] TypeScript compiles (no new errors in touched files)
- [ ] Lint passes (0 errors)
- [ ] Mock DEV code `000000` works end-to-end in dev build

## Required Checks

- `bun lint` — 0 errors
- `npx tsc --noEmit` — 0 new errors in touched files

## Implementation Constraints

- Mock user name in `authService` → `'Tài xế Mai Linh'` (driver, not customer)
- `countryNames.ts` is identical to app_user (no driver-specific changes)
- `phone.ts` is identical to app_user
- `PhoneInput` + `CountryPickerModal` are identical to app_user (shared UI)
- OTP flow logic identical to app_user — only copy/branding may differ
- OTP screen navigates to `/(tabs)/HomeScreen` (same as app_user)
- Do NOT touch app_user files
- Do NOT touch `app_taixe/app/(tabs)/`, onboarding, or index
