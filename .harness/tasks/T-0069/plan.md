# Plan: T-0069 — app_taixe Foundation (Auth + Mapbox + Dashboard)

## Goal

Xây dựng nền tảng cho app_taixe để sẵn sàng cho wave Trip Flow:
1. **Auth flow**: Port phone+OTP authentication từ app_user sang app_taixe
2. **Mapbox integration**: Setup Mapbox SDK và tạo AppMap component
3. **Driver Dashboard**: Màn hình chính cho tài xế với toggle online/offline, GPS broadcast, WebSocket listener

## Requirements

- Auth flow hoàn chỉnh: SigninScreen → OtpScreen → Dashboard
- Mapbox map component có thể hiển thị vị trí tài xế
- Dashboard với toggle online/offline
- GPS location broadcast mỗi 30 giây khi online
- WebSocket listener cho `driver.new_offer` event
- i18n keys cho dashboard (vi + en)
- TypeScript compile không lỗi
- Không phá vỡ onboarding và profile screens hiện có

## Affected Areas

**app_taixe:**
- `app/SigninStack/` — SigninScreen, OtpScreen (port từ app_user)
- `app/(tabs)/HomeScreen.tsx` — thay bằng Driver Dashboard
- `src/components/map/AppMap.tsx` — tạo mới
- `src/components/input/PhoneInput.tsx` — tạo mới
- `src/api/hooks/useAuth.ts` — port OTP hooks
- `src/api/hooks/useDriverLocation.ts` — tạo mới
- `src/api/hooks/useDriverSocket.ts` — tạo mới
- `src/api/socket/socketClient.ts` — tạo mới
- `src/api/axios/config.ts` — thêm driver endpoints
- `src/utils/phone.ts`, `src/utils/countryNames.ts` — tạo mới
- `src/localization/resources/vi.ts`, `en.ts` — thêm dashboard keys
- `package.json` — thêm socket.io-client

## Proposed Approach

### Phase 1: Dependencies & Config

1. **Install socket.io-client**
   ```bash
   cd app_taixe && bun add socket.io-client
   ```

2. **Update API config** (`src/api/axios/config.ts`)
   - Thêm `DRIVER` endpoints:
     - `UPDATE_LOCATION: '/drivers/location'` (PATCH)
     - `GO_ONLINE: '/drivers/online'` (POST)
     - `GO_OFFLINE: '/drivers/offline'` (POST)
     - `GET_STATS: '/drivers/stats'` (GET)

### Phase 2: Auth Flow Port

3. **Port utility files**
   - `src/utils/phone.ts` — phone validation helpers
   - `src/utils/countryNames.ts` — country name mapping (Hermes-compatible)

4. **Port PhoneInput component**
   - `src/components/input/PhoneInput.tsx`
   - Copy pattern từ app_user, điều chỉnh styling cho app_taixe theme

5. **Port auth hooks**
   - `src/api/hooks/useAuth.ts`
   - Replace existing login/register hooks với:
     - `useRequestOtp()` — request OTP code
     - `useVerifyOtp()` — verify OTP và nhận tokens
     - `useLogout()` — logout
   - Mock dev code `000000` cho testing

6. **Update auth screens**
   - `app/SigninStack/SigninScreen.tsx` — dùng PhoneInput, gọi useRequestOtp
   - `app/SigninStack/OtpScreen.tsx` — nhập OTP 6 số, gọi useVerifyOtp
   - Navigation: sau khi verify success → navigate đến `(tabs)`

### Phase 3: Mapbox Integration

7. **Verify Mapbox setup** (T-0055 đã làm)
   - Check `@rnmapbox/maps` trong package.json ✓
   - Check `app.config.ts` có MAPBOX_DOWNLOAD_TOKEN ✓
   - Check `.env` có MAPBOX_ACCESS_TOKEN ✓

8. **Create AppMap component**
   - `src/components/map/AppMap.tsx`
   - Props: `camera`, `markers`, `routePolyline`, `onRegionChange`
   - Follow pattern từ app_user AppMap
   - Hiển thị driver location marker

### Phase 4: WebSocket Client

9. **Create socket client**
   - `src/api/socket/socketClient.ts`
   - Singleton pattern giống app_user
   - Auto-connect khi có access token
   - Auto-reconnect với exponential backoff

10. **Create driver socket hook**
    - `src/api/hooks/useDriverSocket.ts`
    - Listen `driver.new_offer` event
    - Callback để navigate đến OfferScreen (T-0070 sẽ implement)
    - Mock data cho dev testing

### Phase 5: Location Broadcasting

11. **Create location hook**
    - `src/api/hooks/useDriverLocation.ts`
    - Dùng `expo-location` (đã install)
    - `watchPositionAsync` với accuracy cao
    - Broadcast vị trí qua `PATCH /drivers/location` mỗi 30s
    - Return: `{ location, error, startBroadcasting, stopBroadcasting }`

### Phase 6: Driver Dashboard

12. **Replace HomeScreen với DriverDashboard**
    - `app/(tabs)/HomeScreen.tsx`
    - Layout:
      - Top: Status indicator (Online/Offline)
      - Middle: AppMap hiển thị vị trí hiện tại
      - Bottom: Toggle button + stats (trips today)
    - Logic:
      - Khi toggle ON:
        - Gọi `POST /drivers/online`
        - Start GPS broadcasting
        - Connect WebSocket
      - Khi toggle OFF:
        - Gọi `POST /drivers/offline`
        - Stop GPS broadcasting
        - Disconnect WebSocket
      - Listen `driver.new_offer` → prepare navigation (T-0070)

13. **Add i18n keys**
    - `src/localization/resources/vi.ts`:
      ```
      dashboard.online: 'Trực tuyến',
      dashboard.offline: 'Ngoại tuyến',
      dashboard.goOnline: 'Bắt đầu nhận cuốc',
      dashboard.goOffline: 'Dừng nhận cuốc',
      dashboard.tripsToday: 'Cuốc hôm nay',
      dashboard.status: 'Trạng thái',
      dashboard.waitingForOffer: 'Đang chờ cuốc mới...',
      ```
    - `src/localization/resources/en.ts` — tương tự
    - Update `src/localization/iLocalization.ts` interface

### Phase 7: Verification

14. **Test auth flow**
    - SigninScreen → nhập SĐT → OtpScreen → nhập `000000` → Dashboard

15. **Test dashboard**
    - Toggle online → check GPS broadcasting (console.log)
    - Toggle offline → check stop broadcasting
    - Check WebSocket connection (console.log)

16. **TypeScript & Lint**
    ```bash
    cd app_taixe && bunx tsc --noEmit
    cd app_taixe && bun lint
    ```

## Phases / Steps

1. Install socket.io-client
2. Update API config với driver endpoints
3. Port phone utilities (phone.ts, countryNames.ts)
4. Port PhoneInput component
5. Port auth hooks (useRequestOtp, useVerifyOtp, useLogout)
6. Update SigninScreen và OtpScreen
7. Verify Mapbox setup (T-0055)
8. Create AppMap component
9. Create socket client
10. Create driver socket hook
11. Create location broadcast hook
12. Replace HomeScreen với DriverDashboard
13. Add i18n keys
14. Test auth flow end-to-end
15. Test dashboard functionality
16. Run TypeScript & Lint checks

## Risks and Mitigations

**Risk 1: socket.io-client chưa có trong package.json app_user**
- **Mitigation**: Install explicit version vào app_taixe, không phụ thuộc app_user

**Risk 2: T-0058 auth port có thể chưa hoàn chỉnh**
- **Mitigation**: Verify từng file, fill gaps nếu cần. Mock `000000` đảm bảo flow hoạt động

**Risk 3: GPS broadcast 30s có thể tốn pin**
- **Mitigation**: Dùng `watchPositionAsync` thay vì polling. Chỉ broadcast khi location thay đổi đáng kể (>10m)

**Risk 4: WebSocket reconnect khi mất kết nối**
- **Mitigation**: socket.io-client có auto-reconnect built-in. Thêm exponential backoff config

**Risk 5: HomeScreen hiện tại có thể có logic phức tạp**
- **Mitigation**: Read file trước khi replace. Giữ lại components có thể reuse (ServiceSlider, BannerCarousel, NearbyGrid) nếu cần

**Risk 6: Theme/styling khác biệt giữa app_user và app_taixe**
- **Mitigation**: Điều chỉnh styling cho phù hợp với app_taixe theme. Dùng `useAppTheme()` hook

## Architect Required?

No

## Contracting Notes

**Allowed Files:**
- Tất cả files trong `app_taixe/`

**Out of Scope:**
- Trip flow screens (T-0070)
- Offer screen implementation (T-0070)
- app_user changes
- nestjs_prisma changes
- Real backend integration (chỉ mock/stub)
- Push notifications (chỉ dùng WebSocket)
- Turn-by-turn navigation

**Dependencies:**
- T-0055 (Mapbox setup) — ✓ Done
- T-0058 (Auth port) — ✓ Done (files exist)

**Mock Strategy:**
- OTP code: `000000` cho dev testing
- Driver user: `{ id, name: "Tài xế Mai Linh", phone, role: 'DRIVER' }`
- Trips today: hardcoded `0`
- WebSocket: mock event sau 5s nếu không có connection

## Testing Strategy

**Manual Testing:**
1. Auth flow: SigninScreen → OtpScreen → Dashboard
2. Toggle online/offline và verify GPS broadcasting
3. Verify WebSocket connection
4. Check AppMap renders correctly
5. Verify i18n keys hiển thị đúng

**Automated Checks:**
```bash
cd app_taixe
bunx tsc --noEmit  # TypeScript check
bun lint            # ESLint check
```

**Acceptance Criteria:**
- [ ] Auth flow hoạt động end-to-end với mock OTP
- [ ] Dashboard hiển thị online/offline toggle
- [ ] GPS broadcast hoạt động khi online (check console.log)
- [ ] WebSocket listener registered (check console.log)
- [ ] AppMap component renders không lỗi
- [ ] i18n keys đầy đủ cho vi + en
- [ ] TypeScript compile không lỗi
- [ ] ESLint pass
- [ ] Onboarding + Profile screens không bị phá vỡ

## Estimated Effort

**2-3 giờ** (4 files mới, 5-6 files modify, port pattern từ app_user)

## Approval Gate

Waiting for user approval before Contracting.
