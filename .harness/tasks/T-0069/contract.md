# Contract: T-0069

## Source Inputs
- Plan: `.harness/tasks/T-0069/plan.md`
- Task description: `.harness/tasks/T-0069/description.md`
- Project state: `.harness/PROJECT_STATE.md`

## Scope

1. **Auth verification & gap-filling** -- T-0058 already ported phone+OTP flow (SigninScreen, OtpScreen, PhoneInput, authService, useAuth hooks all exist and are wired). Verify end-to-end works. Adjust mock driver user shape from `'Khach Mai Linh'` to `'Tai xe Mai Linh'` with `role: 'DRIVER'`.

2. **API config -- driver endpoints** -- Add `DRIVER` section to `ENDPOINTS` in `config.ts`: `UPDATE_LOCATION`, `GO_ONLINE`, `GO_OFFLINE`, `GET_STATS`.

3. **WebSocket client** -- Create `src/api/socket/socketClient.ts` (singleton, socket.io-client, auto-connect with token, auto-reconnect). Create `src/api/hooks/useDriverSocket.ts` (listen `driver.new_offer`, callback for navigation).

4. **GPS location broadcast hook** -- Create `src/api/hooks/useDriverLocation.ts` using `expo-location` (already installed). `watchPositionAsync` with high accuracy, broadcast via `PATCH /drivers/location` every 30s. Return `{ location, error, startBroadcasting, stopBroadcasting }`.

5. **Driver Dashboard (HomeScreen)** -- Replace `app/(tabs)/HomeScreen.tsx` with driver dashboard: online/offline toggle, AppMap showing current location, status display, trips today count (mock: 0), WS listener wired.

6. **i18n keys** -- Add dashboard keys to `vi.ts`, `en.ts`, and `iLocalization.ts` interface.

7. **Install socket.io-client** -- `bun add socket.io-client` in `app_taixe/`.

## Out of Scope

- Trip flow screens (T-0070)
- Offer screen implementation (T-0070)
- `app_user/` -- no changes
- `nestjs_prisma/` -- no changes
- Real backend integration (mock/stub only)
- Push notifications
- Turn-by-turn navigation
- Background GPS (foreground only for now)
- Modifying `AppMap.tsx` (already complete from T-0055)
- Modifying auth screens (`SigninScreen.tsx`, `OtpScreen.tsx`) unless wiring gaps found
- Modifying `PhoneInput.tsx`, `CountryPickerModal.tsx` (already complete)
- Onboarding screens
- Profile screen

## Allowed Files

### New files to create
- `app_taixe/src/api/socket/socketClient.ts`
- `app_taixe/src/api/hooks/useDriverSocket.ts`
- `app_taixe/src/api/hooks/useDriverLocation.ts`

### Existing files to modify
- `app_taixe/package.json` -- add socket.io-client dependency
- `app_taixe/src/api/axios/config.ts` -- add DRIVER endpoints
- `app_taixe/src/api/services/authService.ts` -- adjust mock driver user shape (name, role)
- `app_taixe/app/(tabs)/HomeScreen.tsx` -- replace with Driver Dashboard
- `app_taixe/src/localization/resources/vi.ts` -- add dashboard i18n keys
- `app_taixe/src/localization/resources/en.ts` -- add dashboard i18n keys
- `app_taixe/src/localization/iLocalization.ts` -- add dashboard key types

### Files to verify only (read, do not modify unless gaps found)
- `app_taixe/app/SigninStack/SigninScreen.tsx`
- `app_taixe/app/SigninStack/OtpScreen.tsx`
- `app_taixe/app/SigninStack/_layout.tsx`
- `app_taixe/src/api/hooks/useAuth.ts`
- `app_taixe/src/components/input/PhoneInput.tsx`
- `app_taixe/src/utils/phone.ts`
- `app_taixe/src/utils/countryNames.ts`
- `app_taixe/src/components/map/AppMap.tsx`
- `app_taixe/src/constants/mapbox.ts`
- `app_taixe/app/_layout.tsx`
- `app_taixe/app/(tabs)/_layout.tsx`

## Protected Files / Projects

- `app_user/**` -- no changes
- `nestjs_prisma/**` -- no changes
- `app_taixe/app/onboarding/**` -- no changes
- `app_taixe/app/(tabs)/ProfileScreen.tsx` -- no changes
- `app_taixe/src/components/map/AppMap.tsx` -- no changes (already complete)
- `app_taixe/app.config.ts` -- no changes
- `app_taixe/app.json` -- no changes

## Acceptance Criteria

- [ ] Driver can open app, go through phone+OTP (mock `000000`), land on dashboard
- [ ] Dashboard shows online/offline toggle with clear visual indicator
- [ ] Toggling online starts GPS broadcast every 30s (verifiable via console.debug)
- [ ] Toggling offline stops GPS broadcast
- [ ] WebSocket client connects when online, disconnects when offline
- [ ] WS listener registered for `driver.new_offer` event (console.debug on receive)
- [ ] AppMap component renders in dashboard showing current location
- [ ] i18n keys present for vi + en (dashboard.online, dashboard.offline, dashboard.goOnline, dashboard.goOffline, dashboard.tripsToday, dashboard.status, dashboard.waitingForOffer)
- [ ] TypeScript compiles without errors (`bunx tsc --noEmit`)
- [ ] ESLint passes (`bun lint`)
- [ ] Existing onboarding + profile screens not broken
- [ ] Mock driver user has name "Tai xe Mai Linh" and role "DRIVER"

## Required Checks

- [ ] TypeScript: `cd app_taixe && bunx tsc --noEmit`
- [ ] ESLint: `cd app_taixe && bun lint`
- [ ] Manual verification: auth flow end-to-end with mock OTP

## API Contract

### PATCH /api/v1/drivers/location (already implemented backend T-0063)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ lat: number, lng: number, heading?: number }`
- **Response**: `{ success: true }`
- **Note**: Frontend calls this every 30s when driver is online. Backend is real (T-0063), but for T-0069 dev testing, mock/stub is acceptable.

### POST /api/v1/drivers/online (not yet implemented backend)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true }`
- **Mock**: Return success immediately in dev mode.

### POST /api/v1/drivers/offline (not yet implemented backend)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true }`
- **Mock**: Return success immediately in dev mode.

### GET /api/v1/drivers/stats (not yet implemented backend)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ tripsToday: number }`
- **Mock**: Return `{ tripsToday: 0 }` in dev mode.

### WS Event: driver.new_offer (receive, backend implemented T-0063)
```json
{
  "offerId": "string",
  "bookingId": "string",
  "pickup": { "address": "string", "lat": number, "lng": number },
  "destination": { "address": "string" },
  "fare": number,
  "expiresAt": "ISO string"
}
```

## Database / Migration Impact

None. No schema changes.

## Security / Secrets / Auth Impact

- Auth flow reuses existing OTP pattern from T-0058 (phone + OTP, mock `000000` in `__DEV__`).
- WebSocket connection uses existing access token from `ZustandPersist`.
- No new secrets or env vars needed (MAPBOX_ACCESS_TOKEN already configured from T-0055).
- socket.io-client connects to same backend base URL.

## Implementation Constraints

1. **Mock strategy**: All backend calls that are not yet implemented (go online/offline, stats) must short-circuit in `__DEV__` mode with mock responses. Follow the same pattern as `authService.ts` (check `__DEV__` before API call).
2. **No real backend required**: The task must be fully testable without a running backend.
3. **Follow app_taixe conventions**: Absolute imports, `useMemo(() => createStyles(theme), [theme])` pattern, `AppText` instead of RN `Text`, English comments, `console.debug` instead of `console.log` (ESLint error).
4. **socket.io-client**: Install as explicit dependency. Use singleton pattern for socket client.
5. **expo-location**: Already installed (`~19.0.8`). Use `watchPositionAsync` with `accuracy: LocationAccuracy.High`.
6. **GPS broadcast interval**: 30 seconds. Only broadcast when location changes significantly (>10m) to save battery.
7. **WebSocket reconnect**: socket.io-client has built-in auto-reconnect. Configure exponential backoff.
8. **StyleSheet pattern**: Follow project convention -- `createStyles` factory below component, consumed via `useMemo`.
9. **No `console.log`**: Use `console.debug` for GPS broadcast logs and WS event logs (ESLint blocks `console.log`).

## Fix Loop Rules

- If TypeScript or ESLint fails, implementer fixes within allowed files.
- If a file outside allowed files needs modification, stop and escalate.
- Maximum 3 fix iterations before escalation.

## Escalation Triggers

- If `expo-location` permission flow requires changes to `app/onboarding/permissions.tsx`
- If socket.io-client version conflicts with existing dependencies
- If AppMap component needs modification to support dashboard use case
- If auth flow has gaps that require changes to `app/_layout.tsx` navigation logic

## User Approvals

None needed. Plan already approved by user.

## Scope Expansion History

(Empty -- no scope changes yet)

## Status

READY_FOR_IMPLEMENTING
