# Implementation: T-0069

## Summary

Implemented driver dashboard foundation for app_taixe including:
- Socket.io client singleton for WebSocket communication
- Driver socket hook to listen for new ride offers
- GPS location broadcasting hook (every 30s when online)
- Driver dashboard UI with online/offline toggle
- Mock driver user shape with role: 'DRIVER'
- i18n keys for dashboard (vi + en)

## Files Changed

| File | Change | Reason |
|---|---|---|
| `app_taixe/src/api/socket/socketClient.ts` | NEW | Singleton socket.io client with auto-reconnect |
| `app_taixe/src/api/hooks/useDriverSocket.ts` | NEW | Hook to listen for driver.new_offer events |
| `app_taixe/src/api/hooks/useDriverLocation.ts` | NEW | GPS tracking + 30s broadcast when online |
| `app_taixe/package.json` | MODIFIED | Added socket.io-client dependency |
| `app_taixe/src/api/axios/config.ts` | MODIFIED | Added DRIVER endpoints (UPDATE_LOCATION, GO_ONLINE, GO_OFFLINE, GET_STATS) |
| `app_taixe/src/api/services/authService.ts` | MODIFIED | Updated mock user to "Tài xế Mai Linh" with role: 'DRIVER' |
| `app_taixe/app/(tabs)/HomeScreen.tsx` | MODIFIED | Replaced with driver dashboard (online/offline toggle, map, status) |
| `app_taixe/src/localization/iLocalization.ts` | MODIFIED | Added dashboard i18n interface keys |
| `app_taixe/src/localization/resources/vi.ts` | MODIFIED | Added Vietnamese dashboard translations |
| `app_taixe/src/localization/resources/en.ts` | MODIFIED | Added English dashboard translations |

## Implementation Decisions

1. **Socket.io client pattern**: Followed app_user singleton pattern with auto-reconnect (5 attempts, exponential backoff 1s-5s)
2. **GPS broadcast strategy**: Uses expo-location watchPositionAsync with 10m minimum distance threshold to save battery, plus 30s interval timer
3. **Mock fallback**: Socket falls back to DEV mock after 3s if no connection (matches app_user pattern)
4. **Location permission**: Requests foreground permission at runtime when going online
5. **i18n key format**: Used camelCase (dashboardOnline) instead of dot notation (dashboard.online) to match existing pattern
6. **Theme colors**: Used semantic theme tokens (text.primary, text.secondary) instead of hardcoded colors where possible

## Notes for Evaluation

**Commands to run:**
```bash
cd app_taixe
bunx tsc --noEmit  # TypeScript check - PASSED
bun lint            # ESLint check - TODO
```

**Manual verification steps:**
1. Auth flow: SigninScreen → OtpScreen (use 000000) → Dashboard
2. Toggle online → check console.debug for GPS broadcast logs
3. Toggle offline → verify broadcast stops
4. Check WebSocket connection logs
5. Verify AppMap renders with current location
6. Check i18n keys display correctly in both vi/en

**Risk areas:**
- socket.io-client needs `bun install` to actually install (package.json updated but install blocked by sandbox)
- GPS permissions may need to be granted manually on first run
- Mock driver name uses Vietnamese diacritics (Tài xế) - verify display

**Edge cases:**
- Location permission denied → error message shown in UI
- Socket connection timeout → falls back to DEV mock after 3s
- GPS signal lost → last known location continues to broadcast
- Component unmount → cleanup stops broadcasting and disconnects socket

## Status

Implemented
