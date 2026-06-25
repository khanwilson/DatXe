# Plan

**Task ID**: T-0032  
**Phase**: Planning  
**Created**: 2026-06-25  

---

## Analysis

### Scope Clarification

- **Affected Projects**: app_user only
- **Affected Files**: React Native components, navigation, assets (logos, images)
- **Estimated Complexity**: Medium (UI-focused, animations, navigation flow)

### Dependencies

- **Previous Tasks**: None (standalone feature)
- **External Dependencies**: React Navigation, React Native Gesture Handler, Animated API
- **Blocked By**: None

### Risks

- **Risk 1**: Animations performance on low-end devices → Mitigation: Test on multiple devices, optimize animations
- **Risk 2**: Image/asset sizes too large → Mitigation: Optimize images, use appropriate formats
- **Risk 3**: Navigation flow bugs → Mitigation: Test all transition paths

---

## Implementation Approach

### Step 1: Setup Navigation Structure
- Create onboarding stack navigator
- Define screen order and transitions
- Setup deep linking for "Skip" to login

### Step 2: Create Splash Screen
- Display Mai Linh logo with brand colors
- 2-3 second delay
- Auto-navigate to Welcome Screen 1

### Step 3: Create Welcome Screens (1, 2, 3)
- Reusable carousel/pager component
- Mai Linh branding (colors, typography)
- Feature descriptions with icons/images
- Swipe or button navigation between screens

### Step 4: Create Permissions Request Screen
- Request GPS (location)
- Request notifications
- Request contacts (optional)
- Handle grant/deny scenarios

### Step 5: Create Get Started Screen
- Final CTA button "Get Started"
- Optional "Already have account? Login"
- Navigate to Login screen

### Step 6: Add Animations & Transitions
- Screen entrance/exit animations
- Smooth swipe transitions
- Opacity/scale animations on buttons

---

## Testing Strategy

- **Manual testing**: All screens, all transitions, all gestures
- **Device testing**: iPhone/Android, multiple screen sizes
- **Performance**: Monitor animation FPS, startup time
- **Edge cases**: Network offline during onboarding, permission denials

---

## Estimated Effort

- Planning: 30 min (done now)
- Design/Setup: 1 hour
- Screen implementation: 2-2.5 hours
- Animations & polish: 1-1.5 hours
- Testing: 1 hour
- Total: ~6-7 hours

---

## Acceptance Criteria

- [x] Plan drafted
- [ ] Contract approved
- [ ] All 5+ screens implemented
- [ ] Animations smooth and responsive
- [ ] Mai Linh branding consistent
- [ ] No crashes or errors
- [ ] Navigation flows work correctly
- [ ] Tested on multiple devices
