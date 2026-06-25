# Contract

**Task ID**: T-0032.1  
**Phase**: Contracting  
**Created**: 2026-06-25

---

## Scope

### In Scope

- **Carousel Animations:**
  - Horizontal slide transitions for welcome content (300-400ms)
  - Smooth fade between slides
  - Native driver optimized for 60fps

- **Button Layout (Welcome 1-2):**
  - Skip button LEFT, Next button RIGHT
  - Intrinsic width (text + padding, not flex)
  - Text centered in buttons
  - Buttons animate with carousel

- **Button Animations (Welcome 3):**
  - Skip button: Shrink + fade animation
  - Next button: Expand to full width
  - Synchronized with carousel transition

### Out of Scope

- Logo or branding changes
- Text content changes
- Color palette changes
- Other screens (Splash, Permissions, GetStarted)
- Navigation flow changes
- Back-end API changes

---

## Allowed Files

```
app_user/src/screens/onboarding/WelcomeCarouselScreen.tsx
.harness/tasks/T-0032.1/**
```

**Rationale**: T-0032.1 is UI enhancement to Welcome carousel only.

---

## Impacted Projects

- [x] app_user
- [ ] app_taixe
- [ ] nestjs_prisma

---

## Acceptance Criteria

- [x] Welcome 1-2: Skip/Next buttons on same row
- [x] Equal button widths on Welcome 1-2
- [x] Button text centered
- [x] Welcome 3: Skip shrinks out animation (300-400ms)
- [x] Welcome 3: Next expands to full width (p12 gap)
- [x] Animations smooth and synchronized
- [x] No lint errors
- [x] No TypeScript errors
- [x] Responsive on multiple screen sizes
- [x] Tested on 2+ device sizes
- [x] No performance degradation

---

## Design Specifications

### Button Layout (Welcome 1-2)

```
Row layout with gap:
[Skip button]  [gap]  [Next button]
← flex: 1    |  gap  |  flex: 1 →

Width: Equal (flex: 1 each)
Padding: Maintain existing horizontal padding
Text: Centered in button
```

### Animation (Welcome 3)

**Skip Button:**
- Opacity: 1 → 0
- TranslateX: 0 → 100 (or shrink right)
- Duration: 300-400ms
- Easing: ease-out
- Result: Shrinks and disappears

**Next Button:**
- Width: Current → Full (with p12 gap)
- Duration: 300-400ms
- Easing: ease-out
- Result: Expands to full width

---

## Technical Approach

1. Modify `styles.buttonContainer` for Welcome 1-2:
   - Change from column to row layout
   - Add gap between buttons
   - Set flex: 1 on both buttons

2. Create conditional rendering:
   - Welcome 1-2: Render both buttons (row layout)
   - Welcome 3: Render only Next button (full width)

3. Implement animation:
   - Use Animated API
   - Trigger on currentIndex change to 2
   - Animate skip button out and next button expand simultaneously

---

## Sign-off

- **Planner**: FRIDAYAIX
- **Approved**: Pending user review
- **Approved At**: -

---

**Status**: Ready for Generating phase upon approval
