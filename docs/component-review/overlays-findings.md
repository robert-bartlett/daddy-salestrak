# Overlay Components Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/`
**Files Reviewed:** alert-dialog.tsx (207 lines), dialog.tsx (196 lines), dropdown-menu.tsx (377 lines), popover.tsx (65 lines), sheet.tsx (264 lines), tooltip.tsx (74 lines), context-menu.tsx (364 lines)

---

## Summary

The overlay components are well-structured and follow consistent patterns across the library. They leverage `@rn-primitives/*` for core functionality and `react-native-reanimated` for native animations. The architecture properly handles iOS portal rendering via `FullWindowOverlay` from `react-native-screens`.

Key strengths include good TypeScript typing, consistent API design, and proper platform-specific handling. However, there are accessibility gaps, missing exit animations on some components, and API inconsistencies that should be addressed.

---

## Critical Issues

### 1. Missing Accessibility Roles on Dialogs/Sheets

**Location:** `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`

None of the modal overlay components explicitly set `accessibilityRole="dialog"` or equivalent ARIA attributes. While the underlying `@rn-primitives` may handle some of this, the components should ensure:
- `aria-modal="true"` on web
- `accessibilityRole="alert"` for AlertDialog (since it's for urgent decisions)
- Screen reader announcements when dialogs open

**Impact:** Screen reader users may not understand they're in a modal context.

### 2. No Exit Animation on Tooltip

**Location:** `tooltip.tsx`, line 46

```tsx
exiting={FadeOut}  // No duration specified
```

The `FadeOut` animation is passed without a duration, unlike the entering animation which has `FadeIn.duration(ANIMATION_DURATION_MS)`. This creates an inconsistent animation experience.

**Fix:** Should be `exiting={FadeOut.duration(ANIMATION_DURATION_MS)}`.

### 3. Missing Dark Mode Wrapper on Most Overlays

**Location:** All overlay components except `sheet.tsx`

Only `sheet.tsx` includes the dark mode class wrapper pattern:

```tsx
// sheet.tsx lines 54-57
<View className={cn(Platform.OS !== 'web' && colorScheme === 'dark' && 'dark', 'flex-1')}>
```

Other overlays (`dialog.tsx`, `alert-dialog.tsx`, `popover.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`) are missing this pattern. Since portals render outside the main React tree on native, CSS variables for dark mode won't work correctly.

**Impact:** Dark mode styling will not apply correctly to overlay content on native platforms.

---

## Warnings

### 1. Inconsistent Animation Durations Across Components

**Locations:**
- `alert-dialog.tsx`: 200ms fade in, 150ms fade out
- `dialog.tsx`: 200ms fade in, 150ms fade out
- `sheet.tsx`: 200ms fade in, 150ms fade out, 300ms slide
- `tooltip.tsx`: 150ms (entering only)
- `popover.tsx`: 200ms both directions

**Recommendation:** Consider extracting animation constants to a shared tokens file for consistency:

```tsx
// tokens/animations.ts
export const OVERLAY_ANIMATION = {
  fadeIn: 200,
  fadeOut: 150,
  slide: 300,
};
```

### 2. No Reduce Motion Support on Most Components

**Location:** All components except `sheet.tsx`

Only `sheet.tsx` respects the user's reduced motion preferences:

```tsx
// sheet.tsx lines 70-71
entering={FadeIn.duration(FADE_IN_DURATION_MS).reduceMotion(ReduceMotion.System)}
exiting={FadeOut.duration(FADE_OUT_DURATION_MS).reduceMotion(ReduceMotion.System)}
```

Other overlay components do not call `.reduceMotion(ReduceMotion.System)` on their animations.

**Impact:** Users with vestibular disorders who prefer reduced motion will still see animations.

### 3. Missing Web Exit Animations

**Location:** `dropdown-menu.tsx`, `context-menu.tsx`

The web animations use `data-[state=closed]:animate-out` classes for sub-content, but the main content components on native only have entering animations (FadeIn) with no exiting animations defined.

```tsx
// dropdown-menu.tsx line 153
<NativeOnlyAnimatedView entering={FadeIn}>  // No exiting prop
```

**Impact:** Content will disappear abruptly on native rather than animating out gracefully.

### 4. StyleProp Type Casting in Menu Components

**Location:** `dropdown-menu.tsx` lines 146-148, `context-menu.tsx` lines 130-132

```tsx
overlayStyle
  ? StyleSheet.flatten([
      StyleSheet.absoluteFill,
      overlayStyle as typeof StyleSheet.absoluteFill,  // Unsafe cast
    ])
```

The type cast is imprecise and could hide type errors. The cast should be more specific.

### 5. Inconsistent z-index Application

**Location:** All overlay components

Some components apply `z-50` to the overlay, others to the content:
- `alert-dialog.tsx`: z-50 on overlay AND content
- `dialog.tsx`: z-50 only on content
- `sheet.tsx`: z-50 only on content
- `popover.tsx`: z-50 only on content
- `tooltip.tsx`: z-50 only on content

While this works due to portal rendering, it creates inconsistency in the codebase.

---

## Suggestions

### 1. Extract Common Overlay Patterns

Multiple overlay components share nearly identical code for:
- `FullWindowOverlay` platform selection
- Portal/Overlay/Content nesting structure
- Animation wrapper logic

Consider creating a shared `OverlayBase` component or hooks:

```tsx
// Example: useOverlayAnimation hook
function useOverlayAnimation(duration = 200) {
  return {
    entering: FadeIn.duration(duration).reduceMotion(ReduceMotion.System),
    exiting: FadeOut.duration(duration).reduceMotion(ReduceMotion.System),
  };
}
```

### 2. Add Focus Trap Documentation

The components rely on `@rn-primitives` for focus management, but there's no documentation about:
- How focus trapping works on each platform
- Whether focus returns to trigger on close
- Keyboard navigation behavior (Escape to close, Tab cycling)

Consider adding JSDoc comments explaining these behaviors.

### 3. Missing `onOpenChange` Type Export

Several components extend primitive props but don't explicitly export the open/onOpenChange callback types that consumers commonly need:

```tsx
// Could add:
export type DialogOpenChangeHandler = (open: boolean) => void;
```

### 4. Add closeOnOverlayPress/closeOnEscape Props

While the primitives likely handle this, the wrapper components don't expose explicit props for:
- `closeOnOverlayPress` (backdrop click to dismiss)
- `closeOnEscape` (Escape key to dismiss)

Making these explicit improves discoverability and allows customization.

### 5. Consider Swipe-to-Dismiss for Sheet

The `Sheet` component uses slide animations but doesn't appear to support swipe gestures for dismissal, which is a common mobile pattern. This could be added using `react-native-gesture-handler`.

### 6. DropdownMenuShortcut Uses RN Text

**Location:** `dropdown-menu.tsx`, line 337

```tsx
import { Text } from 'react-native';  // Raw RN Text

const DropdownMenuShortcut = React.forwardRef<Text, DropdownMenuShortcutProps>(
  ({ className, ...props }, ref) => {
    return (
      <Text  // Should use library Text component
```

This uses the raw React Native `Text` instead of the library's `Text` component, breaking the "zero styling outside library" principle since raw components don't participate in `TextClassContext`.

### 7. Missing Test Coverage

None of the overlay components have dedicated test files. Critical behaviors that should be tested:
- Open/close state management
- Accessibility announcements
- Animation presence
- Portal rendering
- Dark mode in portals

---

## What's Done Well

1. **Consistent Component Structure:** All components follow the same pattern: named constants for magic values (durations, offsets), `forwardRef` with proper typing, `displayName` for debugging, clean type exports alongside component exports.

2. **Platform-Specific Handling:** Excellent use of `Platform.select()` to apply web-only CSS animations while using Reanimated for native.

3. **iOS Portal Handling:** Proper use of `FullWindowOverlay` from `react-native-screens` ensures overlays render above native modals on iOS.

4. **NativeOnlyAnimatedView Abstraction:** Smart abstraction that prevents unnecessary Animated.View wrappers on web while enabling Reanimated on native.

5. **Semantic Variant APIs:** Good use of `cva` (class-variance-authority) for variant-based styling in dropdown-menu and context-menu.

6. **Close Button Accessibility:** Dialog and Sheet close buttons include screen-reader-only labels: `<Text className="sr-only">Close</Text>`

7. **Hit Slop on Touch Targets:** Close buttons have expanded touch targets via `hitSlop` (12px expansion).

8. **TextClassContext Integration:** Proper use of `TextClassContext` to cascade text styles to children without explicit props.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Add dark mode wrapper to all overlay components - Critical for native styling
2. **[Critical]** Fix tooltip exit animation duration - Quick fix, improves UX
3. **[Critical]** Add accessibility roles to dialogs/sheets
4. **[High]** Add `.reduceMotion(ReduceMotion.System)` to all animations - Accessibility requirement
5. **[High]** Add exit animations to dropdown/context menu - Prevents jarring closes
6. **[Medium]** Fix DropdownMenuShortcut to use library Text - Architectural consistency
7. **[Medium]** Add test coverage for critical paths - Quality assurance
8. **[Low]** Consider extracting shared overlay patterns - DRY improvement
9. **[Low]** Document focus management behavior - Developer experience
