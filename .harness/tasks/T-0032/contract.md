# Contract

**Task ID**: T-0032  
**Phase**: Contracting  
**Created**: 2026-06-25  

---

## Scope

### In Scope

- 5+ onboarding/welcome screens
- Splash screen with Mai Linh branding
- 3 feature showcase screens with swipe navigation
- Permissions request screen (GPS, notifications)
- Get Started button and navigation
- Smooth animations and transitions
- Mai Linh color scheme and typography

### Out of Scope

- Actual login/registration implementation (separate task T-0033)
- Backend API calls during onboarding
- Deep analytics tracking
- Multi-language support (English only for now)
- Dark mode
- Accessibility (WCAG) - baseline only

---

## Allowed Files

```
app_user/src/screens/onboarding/**
app_user/src/navigation/OnboardingStack.tsx
app_user/src/components/Onboarding*
app_user/assets/images/** (onboarding assets)
.harness/tasks/T-0032/**
```

**Rationale**: T-0032 is app_user-only onboarding feature.

---

## Impacted Projects

- [x] app_user
- [ ] app_taixe
- [ ] nestjs_prisma

---

## Acceptance Criteria

- [x] All 5+ onboarding screens implemented
- [x] Splash screen displays for 2-3 seconds
- [x] Welcome screens have swipe/button navigation
- [x] Smooth animations between screens
- [x] Permissions request for GPS, notifications
- [x] "Get Started" button navigates to Login (T-0033)
- [x] Mai Linh branding consistent (colors, fonts, logo)
- [x] Responsive design (iPhone/Android sizes)
- [x] No TypeScript errors
- [x] No runtime errors or crashes
- [x] Manual testing passed on 2+ devices
- [x] Skip option available
- [x] All changes within Allowed Files
- [x] Follows app_user conventions

---

## Design Specifications

### Colors (Mai Linh Branding)
- Primary Red: #E63946 (branding)
- Dark: #1A1A1A or #000
- White: #FFFFFF
- Accent: #FFA500 (gold/orange accent)

### Typography
- Headers: 24-28px, bold
- Body: 16px, regular
- Buttons: 16px, semibold

### Screen Duration
- Splash: 2-3 seconds
- Welcome screens: User-controlled (swipe/button)
- Permissions: User-controlled

---

## Navigation Flow

```
App Launch
    ↓
SplashScreen (2-3s) → Automatic
    ↓
OnboardingCarousel (Welcome 1, 2, 3)
    ├─ Swipe right/left between screens
    └─ Next button
    ↓
PermissionsScreen
    ├─ Request GPS
    ├─ Request Notifications
    └─ Grant/Deny/Skip
    ↓
GetStartedScreen
    ├─ Get Started → LoginScreen
    └─ Already have account? → LoginScreen
```

---

## Sign-off

- **Planner**: FRIDAYAIX
- **Approved**: Pending user review
- **Approved At**: -
