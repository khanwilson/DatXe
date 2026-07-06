# T-0058 Plan — Port signin flow from app_user → app_taixe

**Phase**: Planning  
**Model**: Sonnet (single-project, clear scope)  
**Created**: 2026-07-06

---

## Goal

Port the phone + OTP signin flow from app_user into app_taixe so the driver app has identical auth UX, adapting copy and mock user shape for drivers.

---

## What Exists in app_taixe (will be replaced/updated)

| File | Current state | Action |
|------|--------------|--------|
| `app/SigninStack/_layout.tsx` | `SigninScreen` + `SignupScreen` | Replace: add `OtpScreen`, remove `SignupScreen` |
| `app/SigninStack/SigninScreen.tsx` | email/password mock | Replace with phone input screen |
| `app/SigninStack/SignupScreen.tsx` | email/password mock | Delete (OTP flow has no separate signup) |
| `src/api/services/authService.ts` | email/password login/register | Replace with OTP authService (same pattern as app_user, mock user name = "Tài xế Mai Linh") |
| `src/api/hooks/useAuth.ts` | useLogin / useRegister | Replace with useRequestOtp / useVerifyOtp / useLogout |
| `src/api/hooks/index.ts` | re-exports useLogin/useRegister | Update exports |
| `src/api/services/index.ts` | re-exports old authService | Update exports |
| `src/localization/iLocalization.ts` | 5 keys only | Extend with auth + country picker keys |
| `src/localization/resources/en.ts` | 5 keys only | Add auth + country picker keys |
| `src/localization/resources/vi.ts` | 5 keys only | Add auth + country picker keys |

## What Needs to Be Created

| File | Source | Notes |
|------|--------|-------|
| `app/SigninStack/OtpScreen.tsx` | app_user copy | Identical logic; no changes needed |
| `src/components/input/PhoneInput.tsx` | app_user copy | Identical |
| `src/components/input/CountryPickerModal.tsx` | app_user copy | Identical |
| `src/utils/phone.ts` | app_user copy | Identical (libphonenumber-js util) |
| `src/utils/countryNames.ts` | app_user copy | Identical CLDR map |

## Dependency to Install

- `libphonenumber-js` — not in app_taixe yet. Same version as app_user.

---

## Implementation Steps

1. **Install `libphonenumber-js`** — add to `package.json`, ask user to run `bun install`.
2. **Copy utilities** — `src/utils/phone.ts`, `src/utils/countryNames.ts` (identical, no changes).
3. **Copy components** — `src/components/input/PhoneInput.tsx`, `src/components/input/CountryPickerModal.tsx` (identical, no changes).
4. **Replace authService** — rewrite `src/api/services/authService.ts` with OTP pattern; mock user name = `'Tài xế Mai Linh'` (instead of `'Khách Mai Linh'`).
5. **Replace useAuth hooks** — rewrite `src/api/hooks/useAuth.ts` with `useRequestOtp` / `useVerifyOtp` / `useLogout`.
6. **Update index re-exports** — `src/api/hooks/index.ts`, `src/api/services/index.ts`.
7. **Replace SigninScreen** — rewrite `app/SigninStack/SigninScreen.tsx` (identical to app_user).
8. **Create OtpScreen** — create `app/SigninStack/OtpScreen.tsx` (identical to app_user).
9. **Update SigninStack layout** — swap `SignupScreen` for `OtpScreen` in `_layout.tsx`.
10. **Delete SignupScreen** — remove `app/SigninStack/SignupScreen.tsx`.
11. **Extend localization** — add all auth + country picker keys to `iLocalization.ts`, `en.ts`, `vi.ts` (copy from app_user, keeping driver-appropriate copy).
12. **Evaluate** — lint + typecheck.

---

## Adapter Changes (driver-specific)

- Mock `verifyOtp` user name: `'Tài xế Mai Linh'` (vs `'Khách Mai Linh'` in app_user).
- After `verifyOtp` success, navigate to `/(tabs)/HomeScreen` (same route as app_user — tab route exists in app_taixe).
- No other behavioral differences.

---

## Out of Scope

- No new screens beyond SigninScreen + OtpScreen.
- No Goong/Places service (app_taixe doesn't need it yet).
- No changes to app_user.
- No backend changes.

---

## Allowed Files

```
app_taixe/package.json
app_taixe/app/SigninStack/_layout.tsx
app_taixe/app/SigninStack/SigninScreen.tsx          (replace)
app_taixe/app/SigninStack/OtpScreen.tsx             (new)
app_taixe/app/SigninStack/SignupScreen.tsx           (delete)
app_taixe/src/api/services/authService.ts           (replace)
app_taixe/src/api/services/index.ts
app_taixe/src/api/hooks/useAuth.ts                  (replace)
app_taixe/src/api/hooks/index.ts
app_taixe/src/components/input/PhoneInput.tsx       (new)
app_taixe/src/components/input/CountryPickerModal.tsx (new)
app_taixe/src/utils/phone.ts                        (new)
app_taixe/src/utils/countryNames.ts                 (new)
app_taixe/src/localization/iLocalization.ts
app_taixe/src/localization/resources/en.ts
app_taixe/src/localization/resources/vi.ts
```

---

## Risks

- `libphonenumber-js` must be installed before typecheck passes — sandbox blocks bun, so user must run `bun install` manually (same as T-0055).
- `SignupScreen` deletion: confirmed it's only referenced in the old `_layout.tsx` stack, which we're replacing anyway.
- Pre-existing TS errors in `OnBoardingScreen.tsx` (theme type mismatch, tracked before T-0055) — not introduced by this task.

---

## Architect Required?

No. Single project, clear port task, no architecture boundary crossed.
