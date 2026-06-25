# Plan

**Task ID**: T-0032.1  
**Phase**: Planning  
**Created**: 2026-06-25

---

## Analysis

### Scope Clarification

- **Affected Projects**: app_user only
- **Affected Files**: 
  - `app_user/src/screens/onboarding/WelcomeCarouselScreen.tsx` (main change)
- **Affected Screens**: Welcome 1, Welcome 2, Welcome 3
- **Complexity**: Medium (layout changes + animations)

### Dependencies

- **Depends On**: T-0032 (must be complete first)
- **Blocked By**: None
- **External Dependencies**: React Native Animated API (already available)

### Risks

- **Risk 1**: Button animations might not be smooth on low-end devices → Mitigation: Use native driver, test on devices
- **Risk 2**: Layout changes might break on small screens → Mitigation: Test responsive sizes

---

## Implementation Approach

### Step 1: Add Carousel Slide Animation Refs
- Create Animated.Value for content translateX (carousel position)
- Track slide index transitions
- Setup timing for 300-400ms transitions

### Step 2: Implement Carousel Scroll Animation
- Modify ScrollView onScroll handler
- Animate content sliding left/right based on scroll progress
- Use native driver for 60fps smooth transitions

### Step 3: Coordinate Button Animations with Carousel
- Skip button: Fade + translateX (animated out on screen 3)
- Next button: Expand width (on screen 3)
- Synchronize with carousel transitions (same duration/easing)
- Use Animated.parallel to coordinate all animations

### Step 4: Refine Button Layout
- Skip button: Left position, intrinsic width
- Next button: Right position on slides 1-2, full width on slide 3
- Both slide with carousel content

### Step 5: Polish Animations
- Verify 60fps performance
- Test easing curves
- Ensure smooth coordination between all animations

---

## Technical Details

**Carousel Animation:**
- Use Animated.Value for translateX offset
- Calculate based on currentIndex and scroll progress
- Update on scroll events

**Button Sync:**
- Use Animated.parallel to coordinate:
  - Carousel content slide
  - Skip button animation (screen 3)
  - Next button expand (screen 3)
- All use same duration/easing for coherence

---

## Testing Strategy

- **Unit**: Verify button layout on different screen sizes
- **Animation**: Verify smooth transitions, no jank
- **Devices**: Test on iPhone/Android, various sizes
- **Edge Cases**: Fast swipe, slow swipe, animation restart

---

## Estimated Effort

- Analysis: 15 min (done)
- Design: 15 min
- Implementation: 1-1.5 hours (layout + animations)
- Testing: 30 min
- Total: ~2-2.5 hours

---

## Acceptance Criteria

- [x] Plan drafted
- [ ] Contract approved
- [ ] Layout changes implemented
- [ ] Animations working smoothly
- [ ] All tests passing
- [ ] No lint/type errors
- [ ] Responsive on all sizes

---

**Status**: Ready for Contracting phase
