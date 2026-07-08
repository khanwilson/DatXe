# T-0069 — FE app_taixe: Foundation (Mapbox + Auth + Dashboard)

**Project**: `app_taixe`
**Wave**: Trip Flow (T-0067)
**Priority**: P0
**Depends on**: T-0055 (Mapbox setup app_taixe — Done), T-0058 (Auth port app_taixe — implemented)

---

## Goal

Build the driver app foundation for the complete trip flow wave. This task covers 3 areas:

1. **Mapbox map component** — reuse pattern from app_user (T-0055 already installed @rnmapbox/maps)
2. **Auth flow** — phone+OTP (T-0058 files exist: OtpScreen, PhoneInput, auth hooks — verify and wire)
3. **Driver dashboard (HomeScreen)** — the main screen a driver sees when logged in:
   - Toggle online/offline status
   - When online: broadcast GPS to `PATCH /api/v1/drivers/location` every 30s
   - Show status: online/offline, trips completed today
   - Listen for WS `driver.new_offer` → navigate to offer screen (T-0070)

---

## Current State of app_taixe

T-0055 is Done: `@rnmapbox/maps` is installed and configured.

T-0058 is partially implemented (files exist per contract):
- `app/SigninStack/OtpScreen.tsx` — present
- `app/SigninStack/SigninScreen.tsx` — replaced with phone input
- `src/components/input/PhoneInput.tsx` — present (or needs creation)
- `src/api/hooks/useAuth.ts` — replaced with OTP hooks
- `src/utils/phone.ts`, `src/utils/countryNames.ts` — present

T-0058 has no status.md — verify whether auth is actually wired end-to-end.

Existing screens in app_taixe:
- `app/(tabs)/HomeScreen.tsx` — placeholder, needs driver dashboard
- `app/(tabs)/ProfileScreen.tsx` — exists
- `app/SigninStack/` — auth screens
- `app/onboarding/` — onboarding flow
- `app/ActiveTripScreen.tsx` — placeholder
- `app/BookingRouteScreen.tsx` — placeholder

---

## Scope for T-0069

### 1. Auth verification & wiring
- Confirm phone+OTP flow works (SigninScreen → OtpScreen → authenticated)
- Confirm `useAuth` hooks (useRequestOtp, useVerifyOtp, useLogout) are wired
- If T-0058 left gaps, fill them
- Mock: `000000` OTP dev bypass, mock driver user shape `{ id, name: "Tài xế Mai Linh", phone }`

### 2. Mapbox map component for app_taixe
- Create `src/components/map/AppMap.tsx` following same pattern as app_user
- Support: camera position, markers, zoomLevel
- Use env `MAPBOX_ACCESS_TOKEN` (already in .env from T-0055)

### 3. Driver Dashboard (HomeScreen)
- Replace `app/(tabs)/HomeScreen.tsx` with full driver dashboard
- **Online/Offline toggle** (prominent UI element)
- **When online**:
  - Start 30s interval: call `PATCH /api/v1/drivers/location` with `{ lat, lng, heading }`
  - Use `expo-location` for GPS (already installed via T-0055 or T-0032.2)
  - Stop interval when going offline
- **Status display**: online/offline indicator, trips today count (mock: 0)
- **WS listener**: subscribe to `driver.new_offer` event → navigate to OfferScreen (stub nav for now, T-0070 will add the screen)
- **WebSocket**: reuse existing WS client pattern from app_user if present, or wire socket.io-client

### 4. i18n keys for dashboard
- Add keys to `src/localization/resources/vi.ts` and `en.ts`:
  - `dashboard.online`, `dashboard.offline`, `dashboard.goOnline`, `dashboard.goOffline`
  - `dashboard.tripsToday`, `dashboard.status`

---

## API Contract

### PATCH /api/v1/drivers/location
**Headers**: `Authorization: Bearer <token>`
**Body**: `{ lat: number, lng: number, heading?: number }`
**Response**: `{ success: true }`

### WS Event: driver.new_offer (receive)
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

---

## Out of Scope

- Trip flow screens (T-0070)
- Offer screen implementation (T-0070)
- app_user changes
- nestjs_prisma changes
- Real backend integration beyond mock/stub
- Push notifications (WS only)
- Turn-by-turn navigation

---

## Acceptance Criteria

1. Driver can open app → go through phone+OTP → land on dashboard
2. Dashboard shows online/offline toggle
3. Toggling online starts GPS broadcast every 30s
4. Toggling offline stops GPS broadcast
5. WS listener is wired (navigates to stub screen on `driver.new_offer`)
6. AppMap component renders correctly in any screen that uses it
7. i18n keys added for vi + en
8. TypeScript compiles without errors
9. Existing onboarding + profile screens not broken
