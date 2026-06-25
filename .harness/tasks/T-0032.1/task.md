# T-0032.1: Onboarding Welcome Screens - Carousel Animations & Button Enhancements

**Title**: Add Carousel Animations & Enhanced Button Layout  
**Priority**: P1  
**Projects**: app_user

---

## Requirement

Enhance the onboarding welcome screens with carousel slide animations for smooth content transitions and refined button layout with coordinated animations.

## UI/Animation Changes Needed

### Carousel Slide Animations (Welcome 1-2-3)

**Content Transitions:**
- Slide in from right → slide out to left (horizontal carousel motion)
- Smooth fade transitions between slides
- Duration: 300-400ms per transition
- Easing: ease-out for natural deceleration

**Button Layout with Animations:**

**Welcome Screen 1-2:**
- Skip button on LEFT
- Next button on RIGHT
- Width = text + padding (intrinsic, not flex)
- Text centered in buttons
- Both buttons slide in/out with content

**Welcome Screen 3:**
- Skip button: Shrinks from right → disappears (synchronized with content slide)
- Next button: Expands to full width (synchronized with content slide)
- Both animations smooth and coordinated

### Animation Coordination

All animations synchronized:
- Content slides horizontally
- Buttons animate simultaneously (skip shrinks, next expands)
- Single smooth transition per slide change
- No jarring or delayed animations

---

## Design Specifications

### Colors & Styling
- Maintain Mai Linh branding (#E63946, #1A1A1A, #FFFFFF)
- Button styling consistent
- Text centered in all buttons

### Animation Details
- Carousel: Horizontal slide transitions (300-400ms)
- Button animations: Synchronized with content
- Native driver optimized (60fps target)
- Accessible (no animation blocking interaction)

---

## Acceptance Criteria

- [ ] Carousel slide animations smooth (content slides left/right)
- [ ] Welcome 1-2: Skip (left) + Next (right) buttons
- [ ] Buttons slide with content transitions
- [ ] Welcome 3: Skip shrinks + disappears (synchronized)
- [ ] Welcome 3: Next expands to full width (synchronized)
- [ ] All animations smooth and coordinated
- [ ] No lint/type errors
- [ ] Carousel animations 60fps capable
- [ ] Tested on multiple screen sizes
- [ ] Maintains Mai Linh branding

---

## Dependencies

- Depends on: T-0032 (Onboarding Welcome Screens)
- No backend changes required

---

**Created**: 2026-06-25  
**Updated**: 2026-06-25  
**Phase**: Planning  
**Status**: Planning
