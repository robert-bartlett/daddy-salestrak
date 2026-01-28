# Navigation & Miscellaneous Components Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/`
**Files Reviewed:** 6 files

### Files Reviewed

1. `accordion.tsx` (198 lines)
2. `nav-menu.tsx` (349 lines)
3. `scroll-area.tsx` (169 lines)
4. `tabs.tsx` (180 lines)
5. `search.tsx` (239 lines)
6. `native-only-animated-view.tsx` (27 lines)

---

## Summary

Overall, this is a well-architected set of components with strong attention to cross-platform compatibility, accessibility basics, and clean API design. The code demonstrates good React Native practices including proper use of Reanimated for animations, haptic feedback on iOS, and thoughtful touch target sizing. However, there are several areas that could benefit from improvement, particularly around accessibility completeness, memoization for performance, and some edge cases in state management.

---

## Critical Issues

### 1. ScrollArea: orientation="both" Does Not Work on Native

**File**: `scroll-area.tsx`
**Lines**: 146-157

The `orientation="both"` mode sets `horizontal={false}` implicitly (ScrollView defaults), but there's no mechanism for bidirectional scrolling on native. React Native's `ScrollView` requires either `horizontal` prop or defaults to vertical - it cannot scroll both directions simultaneously without nested ScrollViews or a different approach.

```tsx
// Current behavior when orientation="both":
<ScrollView
  horizontal={orientation === 'horizontal'}  // false when "both"
  // Results in vertical-only scrolling on native
```

This creates a silent API mismatch where web supports `overflow: auto` for both directions but native does not.

### 2. Tabs: Missing Keyboard Navigation for Web

**File**: `tabs.tsx`
**Lines**: 83-158

The TabsTrigger component sets `role="tab"` and `aria-selected` on web, but there's no implementation of the WAI-ARIA Tabs keyboard navigation pattern:
- Arrow keys should move focus between tabs
- Home/End keys should jump to first/last tab
- Tab key should move focus out of the tablist

This is a significant accessibility gap for keyboard-only users on web.

### 3. Accordion: Missing ARIA Attributes for Web

**File**: `accordion.tsx`
**Lines**: 123-157

The AccordionTrigger sets `aria-expanded` but is missing:
- `aria-controls` linking to the content panel's `id`
- The content panel lacks `aria-labelledby` pointing back to the trigger
- Missing `id` attributes on both elements for the relationship

These are required for proper screen reader announcement of accordion relationships.

---

## Warnings

### 1. NavMenuItem: usePathname Called on Every Render

**File**: `nav-menu.tsx`
**Lines**: 214-256

Every `NavMenuItem` calls `usePathname()` to determine active state. When rendering many menu items, this creates multiple subscriptions to the router state. While expo-router likely optimizes this, consider lifting the pathname check to a higher component and passing `isActive` as a prop, or memoizing the component.

```tsx
const NavMenuItem = React.forwardRef<...>(({ href, ... }, ref) => {
  const pathname = usePathname();  // Called for every item
  // ...
});
```

### 2. Search: Missing Input Focus Management After Clear

**File**: `search.tsx`
**Lines**: 152-154

When the clear button is pressed, the input value is cleared but focus is not returned to the TextInput. This creates a poor UX where users must manually tap back into the input to continue typing.

```tsx
const handleClear = React.useCallback(() => {
  handleChange('');
  // Should also: inputRef.current?.focus();
}, [handleChange]);
```

### 3. NativeOnlyAnimatedView: Web Returns Fragment Instead of View

**File**: `native-only-animated-view.tsx`
**Lines**: 18-19

On web, the component returns a Fragment with just children, discarding all props including `className`, `style`, and the `ref`. This can cause layout issues if the parent expects a View-like element with dimensions.

```tsx
if (Platform.OS === 'web') {
  return <>{props.children as React.ReactNode}</>;  // All props lost
}
```

Consider returning a plain `View` on web to preserve layout behavior:
```tsx
if (Platform.OS === 'web') {
  return <View ref={ref} {...props} />;
}
```

### 4. Accordion: No Entering Animation for Content

**File**: `accordion.tsx`
**Lines**: 182-186

The AccordionContent has an `exiting` animation (`FadeOutUp`) but no `entering` animation on native. This creates an asymmetric experience where content fades out when collapsing but appears instantly when expanding.

### 5. Tabs: handlePress Has Stale Closure Risk

**File**: `tabs.tsx`
**Lines**: 91-107

The `handlePress` callback has `onPress` in its dependency array, but if `onPress` changes frequently (e.g., inline arrow function), this will recreate the callback on every render, defeating the memoization purpose.

---

## Suggestions

### 1. Add Memoization to Heavy Components

**Components**: NavMenuItem, AccordionTrigger, TabsTrigger

These trigger components are likely rendered in lists and would benefit from `React.memo()` to prevent re-renders when parent state changes. Example:

```tsx
const NavMenuItem = React.memo(
  React.forwardRef<...>((...) => { ... })
);
```

### 2. ScrollArea: Add onScroll Callback Support

**File**: `scroll-area.tsx`

For infinite scroll, parallax effects, or scroll-based animations, consumers would benefit from an `onScroll` prop that forwards to the underlying ScrollView/div.

### 3. Search: Add Debounce Option

**File**: `search.tsx`

Consider adding an optional `debounceMs` prop to delay `onValueChange` callbacks for expensive search operations:

```tsx
type SearchProps = ... & {
  /** Debounce delay in ms for onValueChange. 0 = no debounce (default). */
  debounceMs?: number;
};
```

### 4. Tabs: Expose Selected Value Context to Content

**File**: `tabs.tsx`

TabsContent currently doesn't expose whether its value matches the selected tab in an easily consumable way. Adding a `useTabsContent()` hook or render prop pattern would help consumers build more dynamic content.

### 5. NavMenu: Add onOpenChange Callback to Data-Driven API

**File**: `nav-menu.tsx`
**Lines**: 31-44

The data-driven API accepts `items`, `title`, etc., but doesn't explicitly document that `onOpenChange` is available (inherited from RootProps). Consider making this more explicit for tracking menu open/close analytics.

### 6. Accordion: Consider Reducing Animation Complexity

**File**: `accordion.tsx`

The accordion uses multiple Reanimated features: `LayoutAnimationConfig`, `LinearTransition`, `FadeOutUp`, plus a custom `useAnimatedStyle` for chevron rotation. Consider whether all layers are necessary or if simplifying would improve performance on lower-end devices.

### 7. Search: accessibilityRole="search" Should Be "searchbox"

**File**: `search.tsx`
**Line**: 205

The role `"search"` is for the search landmark region, not the input itself. The input should use `"searchbox"` role:

```tsx
accessibilityRole="searchbox"  // Not "search"
```

---

## What's Done Well

### 1. Excellent Cross-Platform Thinking

All components thoughtfully handle platform differences using `Platform.select()`. Web gets CSS transitions and focus states; native gets haptics, `hitSlop`, and Reanimated animations. This is exactly right.

### 2. Haptic Feedback with Throttling

The accordion and tabs implement iOS haptics with a throttle (`HAPTIC_THROTTLE_MS = 100`) to prevent "buzz spam" on rapid taps. The `.catch()` on the haptic promise handles simulator/unsupported device failures gracefully.

### 3. Touch Target Sizing

Both `AccordionTrigger` and `TabsTrigger` use `hitSlop` to expand touch targets to meet the 44pt minimum accessibility guideline. This is often overlooked.

### 4. Controlled/Uncontrolled Pattern in Search

The Search component properly supports both modes with clear warnings in development when switching modes. The `wasControlledRef` pattern is the correct way to detect mode switching.

### 5. TextClassContext Integration

All components properly use `TextClassContext.Provider` and `wrapTextChildren()` to ensure text styling cascades correctly. This is a clean pattern for propagating text styles through component hierarchies.

### 6. Clean API Design

- `NavMenu` supports both data-driven and compound component patterns
- `ScrollArea` has a semantic prop API (`showScrollbar`, `scrollbarSize`, `orientation`)
- `Tabs` variant prop cleanly switches between `"default"` and `"outline"` styles

### 7. TypeScript Strictness

Props are well-typed with discriminated unions where appropriate. The use of `Omit<>` to exclude `asChild` from exposed props prevents API misuse.

### 8. Error Boundary Safety

The haptic feedback in accordion and tabs uses `.catch(() => {})` to silently ignore failures. While a comment explaining this would help, it prevents crashes on simulators or devices without haptic hardware.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Fix `ScrollArea` orientation="both" to either work correctly or throw/warn that it's unsupported on native
2. **[Critical]** Add keyboard navigation to Tabs for web accessibility compliance
3. **[Critical]** Add proper ARIA relationships (`aria-controls`, `aria-labelledby`, `id`) to Accordion
4. **[High]** Fix `NativeOnlyAnimatedView` to preserve props on web
5. **[High]** Add focus management to Search clear button
6. **[High]** Add entering animation to AccordionContent for symmetry
7. **[Medium]** Memoize NavMenuItem, AccordionTrigger, TabsTrigger with `React.memo`
8. **[Medium]** Fix `accessibilityRole="search"` to `"searchbox"` in Search
9. **[Low]** Consider lifting `usePathname()` in NavMenu for many-item performance
10. **[Low]** Add `onScroll` support to ScrollArea
