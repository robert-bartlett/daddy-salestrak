# Combobox Component Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/combobox/`
**Files Reviewed:** 12 files + tests

## Summary

The Combobox component is a well-architected composition of Popover + Command primitives that supports both single-select and multi-select modes with search filtering. The overall design follows React Native best practices with proper context separation, controllable state patterns, and good TypeScript typing. However, there are several performance concerns, accessibility gaps, and architectural issues that should be addressed before production use.

---

## Critical Issues

### 1. No Search Debouncing - Performance Risk

**Location:** `combobox-input.tsx` (via `command-input.tsx` and `command-store.ts`)

**Problem:** Every keystroke in the search input triggers immediate filtering of all items. For large lists (100+ items), this causes:
- Excessive re-renders on every keystroke
- Potential frame drops during fast typing
- Unnecessary CPU usage

**Evidence:**
```typescript
// command-input.tsx line 81-89
const handleChangeText = React.useCallback(
  (text: string) => {
    store.setSearch(text); // Immediate - no debounce
    onValueChange?.(text);
  },
  [store, onValueChange]
);
```

**Recommendation:** Add debounced search (150-300ms) for the filtering operation while keeping the input value responsive. Consider exposing a `debounceMs` prop on ComboboxInput.

---

### 2. Non-Virtualized List Rendering

**Location:** `combobox-list.tsx` (via `command-list.tsx`)

**Problem:** The list uses a plain `ScrollView` on native platforms instead of `FlatList` or `FlashList`. This means:
- All items render simultaneously regardless of visibility
- Memory usage grows linearly with item count
- Scroll performance degrades with large datasets

**Evidence:**
```typescript
// command-list.tsx lines 197-212
<View style={{ maxHeight: maxHeightStyle }}>
  <ScrollView
    ref={scrollViewRef}
    // ... no virtualization
  >
    {filterWhitespaceChildren(children)}
  </ScrollView>
</View>
```

**Recommendation:** For lists exceeding ~50 items, implement virtualization using `FlashList` or expose a `virtualized` prop that switches the rendering strategy.

---

### 3. Memory Leak in Item Label Registry

**Location:** `combobox-root.tsx` lines 156-163

**Problem:** The `unregisterItemLabel` function does not force a re-render when items unmount, but the comment acknowledges stale entries can accumulate. In dynamic scenarios (items frequently added/removed), this Map grows unbounded.

**Evidence:**
```typescript
const unregisterItemLabel = React.useCallback((itemValue: string) => {
  // Simply delete from the map without forcing re-render.
  // Trade-off: If items are frequently added/removed dynamically, stale entries
  // could accumulate. Consider periodic cleanup if this becomes a memory concern.
  itemLabelsRef.current.delete(itemValue);
}, []);
```

**Recommendation:** Either:
1. Implement periodic cleanup (e.g., on popover close)
2. Use WeakMap if value strings can be converted to object keys
3. Implement proper cleanup with forced update on significant deletions

---

## Warnings

### 4. Nested Context Provider Re-renders

**Location:** `combobox-content.tsx` lines 75-80

**Problem:** A new context object is created on every render of ComboboxContent, which could cause all consumers to re-render unnecessarily.

**Evidence:**
```typescript
const updatedContext = React.useMemo(
  () => ({
    ...parentContext,  // Spreading entire parent context
    closeOnSelect,
  }),
  [parentContext, closeOnSelect]  // parentContext changes on root re-render
);
```

**Impact:** Medium - causes cascading re-renders through the context consumer tree.

**Recommendation:** Consider using separate contexts for stable values vs. frequently changing values.

---

### 5. Missing Native Keyboard Navigation

**Location:** `combobox-trigger.tsx`, `combobox-list.tsx`

**Problem:** Keyboard navigation (arrow keys, Enter to select) only works on web platform. Native platforms lack:
- Focus management between trigger and list
- Hardware keyboard support on tablets/connected keyboards
- TV remote navigation support

**Recommendation:** Implement `onKeyPress` handlers for native platforms that forward to the store's `selectNext`/`selectPrevious` methods.

---

### 6. Type Safety Gap in Popover Props Cast

**Location:** `combobox-root.tsx` lines 230-237

**Problem:** Type casting to bypass TypeScript for controlled popover props is a maintenance risk.

**Evidence:**
```typescript
// Cast popover props to support controlled open state.
const popoverProps = {
  open,
  onOpenChange: setOpen,
} as PopoverPrimitive.RootProps;  // Unsafe cast
```

**Recommendation:** Either contribute proper types to @rn-primitives/popover or document this as a known type limitation.

---

### 7. Incomplete Accessibility Attributes

**Location:** Multiple files

**Problems identified:**
- `ComboboxList`: Missing `accessibilityLabel` prop passthrough on web
- `ComboboxItem`: Uses `accessibilityRole="menuitem"` but should be `"option"` within a combobox context
- `ComboboxTrigger`: Missing `accessibilityHint` to describe the action
- `ComboboxEmpty`: Missing `accessibilityRole="status"` for screen readers

---

### 8. `flex-1` on Root Causes Layout Issues

**Location:** `combobox-root.tsx` line 240

**Problem:** The root View has `className="flex-1"` which forces it to expand within flex containers. This breaks layout when Combobox is used inline or in non-flex contexts.

**Recommendation:** Remove the fixed `flex-1` and let consumers control the width, or use `w-full` for block-level behavior without flex expansion.

---

## Suggestions

### 9. Add Error Boundaries for Resilience

**Problem:** If Command or Popover throws during render, the entire tree unmounts with no recovery.

**Recommendation:** Wrap the content in an error boundary that can show a fallback state or attempt recovery.

---

### 10. Missing `maxItems` Prop for Large Datasets

**Recommendation:** Add a `maxItems` prop to ComboboxList that limits the number of rendered items, with a "Show more" footer for remaining results. This provides a virtualization alternative that works with the composition pattern.

---

### 11. Search Filter Should Be Customizable at Combobox Level

**Problem:** Custom filter functions must be passed to the underlying Command component, which is hidden inside ComboboxContent.

**Recommendation:** Expose `filter` and `shouldFilter` props on ComboboxRoot or ComboboxContent.

---

### 12. Test Coverage Gaps

**Location:** `__tests__/combobox.test.tsx`

**Missing test cases:**
- Uncontrolled mode state persistence
- Keyboard navigation (arrow keys, Enter, Escape)
- `maxDisplayItems` truncation behavior
- Disabled combobox behavior
- Custom children in trigger
- Portal host targeting
- Native platform specific behavior

---

### 13. Consider Exposing Loading State

**Problem:** The underlying Command has loading state support (`CommandLoading`), but Combobox doesn't expose this for async search scenarios.

**Recommendation:** Add `ComboboxLoading` component or expose loading prop for remote data fetching use cases.

---

## What's Done Well

1. **Clean Composition Pattern:** The component follows the established Popover + Command composition pattern, making it consistent with the library's architecture.

2. **Proper Controlled/Uncontrolled Support:** The `useControllableState` hook correctly handles both modes with proper callback synchronization.

3. **Good TypeScript Typing:** Props are well-typed with appropriate use of discriminated unions and literal types for mode-specific behavior.

4. **Memoization Applied Correctly:** Context values and callbacks are properly memoized to prevent unnecessary re-renders.

5. **useSyncExternalStore for State:** The Command store uses the correct pattern for external store subscriptions, ensuring React 18+ concurrent features work correctly.

6. **Platform-Specific Styling:** Good use of `Platform.select()` for web-specific CSS features without breaking native.

7. **Label Registry Pattern:** The item label registration for trigger display is a clever solution to the "display selected label" problem without requiring label prop duplication.

8. **Batch Updates in Store:** The command store batches updates to prevent cascading re-renders during item registration.

9. **displayName Set on All Components:** Helps with React DevTools debugging.

10. **Comprehensive JSDoc Comments:** All components have good documentation explaining usage and behavior.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Add search debouncing to prevent performance issues with fast typing
2. **[Critical]** Fix the `flex-1` layout issue on root component
3. **[Critical]** Address memory leak in item label registry
4. **[High]** Implement native keyboard navigation support
5. **[High]** Fix accessibility roles (menuitem -> option)
6. **[Medium]** Add cleanup mechanism for item label registry
7. **[Medium]** Expose filter customization at Combobox level
8. **[Low]** Add error boundary wrapper
9. **[Low]** Expand test coverage
