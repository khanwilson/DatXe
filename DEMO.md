# Demo Mode — Changes to Revert for Production

This file tracks all shortcuts and bypasses applied to make the app work in demo
mode (production builds hitting a dev server). **Every item below must be
reverted before shipping to real users.**

---

## 1. Backend: OTP bypass (`NODE_ENV=development`)

| What | Detail |
|------|--------|
| File | `nestjs_prisma/api/auth/auth.service.ts` (line ~130) |
| Change | Server accepts OTP code `000000` when `NODE_ENV !== 'production'` |
| How applied | `docker-compose.yml` → `environment: NODE_ENV: development` |
| Revert | Set `NODE_ENV: production` in docker-compose (or remove the line — Dockerfile defaults to production). Wire real SMS provider (Zalo ZNS / carrier gateway) to send actual OTP codes and validate against Redis storage. |

---

## 2. Backend: iOS ATS — HTTP allowed

| What | Detail |
|------|--------|
| Files | `app_taixe/app.config.ts`, `app_user/app.config.ts` |
| Change | Added `NSAllowsArbitraryLoads: true` to `infoPlist.NSAppTransportSecurity` |
| Revert | Remove `NSAppTransportSecurity` block entirely. Deploy backend behind HTTPS with a real domain + TLS certificate. Update `baseUrl` in both apps to `https://yourdomain.com/api/v1`. |

---

## 3. app_user: Trip animation always runs (removed `__DEV__` gate)

| What | Detail |
|------|--------|
| File | `app_user/app/ActiveTripScreen.tsx` (lines ~161–212) |
| Change | Removed `if (!__DEV__ || ...)` guards on EN_ROUTE approach animation and IN_PROGRESS mock animation. Animation now runs on all builds. |
| Revert | Re-add `__DEV__` gate: `if (!__DEV__ || !isEnRoute || ...) return;` and `if (!__DEV__ || status !== 'IN_PROGRESS') return;`. Restore `const enRouteDriverCoord = __DEV__ ? remainingApproach?.[0] ?? null : driverCoord;`. Real builds should rely solely on `driver.location_updated` socket events from the backend. |

---

## Summary: What needs real implementation before production

1. **SMS OTP provider** — replace `000000` bypass with real Zalo ZNS / carrier SMS
2. **HTTPS + domain** — TLS cert, remove ATS exception, update baseUrl
3. **Live driver GPS → socket** — once `driver.location_updated` flows reliably, re-gate animations behind `__DEV__` so production uses real GPS only
4. **Redis production config** — secure password, persistence, clustering if needed

---

*Last updated: 2026-07-17*
