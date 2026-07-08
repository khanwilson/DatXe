# Decisions: T-0069

## Decision 1: Socket.io client pattern
**Decision**: Follow app_user singleton pattern with `getSocket()` / `disconnectSocket()` functions
**Reason**: Consistency across codebase, proven pattern, auto-reconnect built-in

## Decision 2: GPS broadcast strategy
**Decision**: Use expo-location `watchPositionAsync` with 10m distance threshold + 30s interval timer
**Reason**: Balances battery life with location accuracy. watchPositionAsync is more efficient than polling. 10m threshold prevents excessive broadcasts when stationary.

## Decision 3: Mock fallback timing
**Decision**: Fall back to DEV mock after 3s if socket doesn't connect
**Reason**: Matches app_user pattern (useBookingSocket uses 2s). Gives enough time for real connection while ensuring dev testing works without backend.

## Decision 4: i18n key naming
**Decision**: Use camelCase (dashboardOnline) instead of dot notation (dashboard.online)
**Reason**: Matches existing pattern in app_taixe (tripFinding, authPhoneTitle, etc.). Consistency with codebase convention.

## Decision 5: Location permission timing
**Decision**: Request permission when driver toggles online, not on app startup
**Reason**: Follows just-in-time permission pattern from PROJECT_STATE.md. Less intrusive UX, permission only requested when actually needed.

## Decision 6: Theme color usage
**Decision**: Use semantic theme tokens (text.primary, text.secondary) where available, hardcoded colors for status indicators
**Reason**: Status colors (green for online, red for offline, gray for offline) are universal and not theme-dependent. Text colors should respect theme.

## Decision 7: TypeScript type for setInterval
**Decision**: Use `ReturnType<typeof setInterval>` instead of `NodeJS.Timeout`
**Reason**: React Native doesn't have NodeJS types. ReturnType pattern is RN-compatible and type-safe.

## Decision 8: socket.io-client import
**Decision**: Use `@ts-ignore` for socket.io-client import
**Reason**: Matches app_user pattern. socket.io-client may not have perfect TypeScript definitions in RN environment.
