# Keyboard Navigation & Empty Component Review Findings

**Reviewed:** 2026-01-27
**Paths:**
- `/Users/brennon/dev/design/design-prototypes/hooks/use-list-keyboard-navigation.ts`
- `/Users/brennon/dev/design/design-prototypes/components/ui/empty/`

**Note:** The `keyboard-nav/` directory specified does not exist. The keyboard navigation functionality is implemented in `/hooks/use-list-keyboard-navigation.ts`.

---

## Summary

Both modules are well-architected with good TypeScript typing and follow React Native best practices. There are a few issues around animation cleanup, accessibility gaps, and missing dependency in the useEffect for the Empty animation that should be addressed.

---

## Critical Issues

### 1. Missing Animation Cleanup in EmptyMedia (Memory Leak Risk)

**File:** `empty/empty-media.tsx` (lines 53-63)

The animation `withRepeat` runs indefinitely but is never cancelled when the component unmounts or when the variant changes. This can cause memory leaks and unexpected behavior.

```tsx
// Current (problematic):
React.useEffect(() => {
  if (variant === 'animation' && Platform.OS !== 'web') {
    opacity.value = withRepeat(
      withTiming(PULSE_MIN_OPACITY, {
        duration: PULSE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }
}, [variant]);  // Missing opacity in deps

// Should include cleanup:
React.useEffect(() => {
  if (variant === 'animation' && Platform.OS !== 'web') {
    opacity.value = withRepeat(...);
  }
  return () => {
    cancelAnimation(opacity);  // Import from react-native-reanimated
  };
}, [variant, opacity]);
```

### 2. Missing Dependency in useEffect

**File:** `empty/empty-media.tsx` (line 64)

The `opacity` shared value is used inside the effect but not listed in the dependency array. While shared values are refs and typically stable, the ESLint exhaustive-deps rule would flag this, and it can lead to stale closures in certain scenarios.

---

## Warnings

### 1. Web Keyboard Listener Attached to Window (Global Scope)

**File:** `hooks/use-list-keyboard-navigation.ts` (lines 405-416)

The `setupWebKeydownListener` attaches to `window`, which means it captures all keyboard events globally. If multiple components use this hook simultaneously, or if the popover is closed but the listener is not cleaned up by the consuming component, this could cause conflicts or unexpected behavior.

```tsx
// Current:
window.addEventListener('keydown', handleKeyDown);

// Consider: Attaching to a specific container element via ref, or ensuring
// the hook consumer always calls the cleanup function properly.
```

The current design requires the consumer to correctly call the cleanup function returned from `setupWebKeydownListener()`. If they forget, listeners accumulate.

### 2. Missing ARIA Roles on Empty Component

**File:** `empty/empty-root.tsx`

The Empty state component should have appropriate ARIA attributes for screen readers to understand its purpose:

```tsx
// Suggestion: Add semantic ARIA attributes
<View
  ref={ref}
  role="status"  // or "alert" depending on context
  aria-label="Empty state"
  className={cn(emptyRootVariants({ size }), className)}
  {...props}
>
```

### 3. TextInput onKeyPress Lacks Modifier Key Support on Native

**File:** `hooks/use-list-keyboard-navigation.ts` (lines 385-397)

The comment correctly notes that `TextInput.onKeyPress` doesn't provide modifier keys on native platforms. This means Cmd/Ctrl+Arrow shortcuts for first/last navigation won't work on iOS/Android. Consider documenting this limitation or finding an alternative approach for native platforms.

```tsx
// Current behavior:
const handleKeyPress = React.useCallback(
  (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const key = event.nativeEvent.key;
    // TextInput doesn't provide modifier keys in onKeyPress
    // We handle modifiers through the web keydown listener instead
    const handled = handleKey(key, false, false);  // Always false for modifiers
```

---

## Suggestions

### 1. Consider Memoizing filterEntityItems Results

**File:** `entity-selector/entity-selector-context.tsx` (lines 168-180)

The `filterEntityItems` function is called on every render via `getNavigableItems`. For large item lists, consider memoizing at the call site or using `useMemo` more aggressively.

### 2. Add Screen Reader Announcements for Highlight Changes

**File:** `hooks/use-list-keyboard-navigation.ts`

When the highlighted item changes via keyboard navigation, screen readers should be notified. The `aria-activedescendant` pattern is used in `entity-selector-input.tsx`, which is good. Ensure all consumers follow this pattern.

### 3. Empty Component Could Benefit from Animation Variants

**File:** `empty/empty-root.tsx`

Consider adding entry animations (fade-in, scale) for empty states to make them feel more polished. This would align with modern UI patterns.

### 4. Add Unit Tests for Keyboard Navigation Edge Cases

**File:** `hooks/use-list-keyboard-navigation.ts`

The hook has no tests. Consider adding tests for:
- All items disabled
- Empty items array
- Loop vs non-loop behavior at boundaries
- Modifier key combinations
- The `setupWebKeydownListener` cleanup

### 5. TypeScript: Consider Using `as const` for Action Types

**File:** `hooks/use-list-keyboard-navigation.ts` (line 28)

```tsx
// Current:
export type ListKeyboardAction =
  | 'next'
  | 'previous'
  | 'first'
  | 'last'
  | 'select'
  | 'escape'
  | null;

// Could also define as a const object for runtime value access:
export const LIST_KEYBOARD_ACTIONS = {
  NEXT: 'next',
  PREVIOUS: 'previous',
  // ...
} as const;
```

### 6. Empty Media Icon Sizing Not Connected to Size Variant

**File:** `empty/empty-media.tsx`

The icon container size varies by `size` prop, but the actual icon inside may not scale accordingly. Consider providing icon size through context or props.

---

## What's Done Well

1. **Excellent Hook API Design:** The `useListKeyboardNavigation` hook has a clean, well-documented API with clear separation of concerns, comprehensive JSDoc comments with examples, sensible defaults, and support for disabled item skipping.

2. **Proper Cleanup Pattern for Web Listener:** The `setupWebKeydownListener` correctly returns a cleanup function that removes the event listener, following React's effect cleanup pattern.

3. **Composable Empty State Architecture:** The Empty component follows the compound component pattern well with `EmptyRoot` providing context, subcomponents consuming via `useEmptySize()`, and clean separation between Header, Content, Media, Title, Description.

4. **Consistent CVA Usage:** Both modules use `class-variance-authority` consistently for variant management, which is the project standard.

5. **Cross-Platform Considerations:** Both modules properly handle platform differences with `Platform.select()` for web-specific styles, separate web keydown listener vs native onKeyPress handling, and web-specific CSS animations vs Reanimated for native.

6. **Good TypeScript Generics:** The `useListKeyboardNavigation` hook uses generics (`<T extends NavigableItem>`) to preserve type information for the items, allowing consumers to access full item data in callbacks.

7. **Comprehensive Test Coverage for Empty:** The Empty component has thorough tests covering all size variants, all media variants, context error handling, custom className/props passthrough, and full composition scenarios.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Fix animation cleanup in EmptyMedia - Add `cancelAnimation(opacity)` in useEffect cleanup and add `opacity` to dependency array
2. **[High]** Add ARIA role to Empty root - Improve screen reader experience
3. **[High]** Document native modifier key limitation - Make consumers aware Cmd/Ctrl shortcuts don't work on native
4. **[Medium]** Add tests for useListKeyboardNavigation - Critical hook lacks test coverage
5. **[Medium]** Consider scoped keyboard listener - Evaluate if window-level listener causes issues with multiple instances
