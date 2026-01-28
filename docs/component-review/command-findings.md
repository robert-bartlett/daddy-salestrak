# Command Component Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/command/`
**Files Reviewed:** 13 files + tests

## Summary

The command component is well-architected with a clean separation between store logic, context providers, and UI components. It demonstrates good React patterns and thoughtful API design. However, there are several performance concerns around re-render behavior, a few accessibility gaps, and some missing edge case handling that should be addressed.

---

## Critical Issues

### 1. useCommandState selector does not use memoization - causes unnecessary re-renders

**Location:** `command-context.tsx`, lines 62-76

```typescript
export function useCommandState<T>(
  selector?: (state: CommandState) => T
): CommandState | T {
  const store = useCommand();

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  );

  return selector ? selector(state) : state;
}
```

**Problem:** The selector is applied AFTER `useSyncExternalStore`, meaning every subscriber re-renders on ANY state change, then the selector is applied. This defeats the purpose of selective subscriptions. Components using `useCommandItemSelected(value)` will re-render on every state change (search, filtered items, etc.), not just when their selection status changes.

**Impact:** With many CommandItem components (100+ items), this will cause significant re-render cascades on every keystroke during search.

**Recommendation:** Implement a proper selector pattern using `useSyncExternalStoreWithSelector` from the `use-sync-external-store` package, or use a ref-based comparison to bail out of renders when the selected value has not changed.

---

### 2. Duplicate keyboard event handling between command-root and command-input

**Location:**
- `command-root.tsx`, lines 113-171
- `command-input.tsx`, lines 95-130

**Problem:** Both components register keyboard event handlers for the same keys (ArrowUp, ArrowDown, Enter, etc.). On web, both handlers fire for the same keypress, causing double invocations of navigation methods.

The command-root uses `window.addEventListener('keydown')` while command-input uses `onKeyPress`. While they use different event sources, the root's listener checks `rootNode.contains(targetNode)` which will be true when the input has focus.

**Impact:** Navigation may skip items or behave unexpectedly. The `store.selectNext()` could be called twice per arrow key press.

**Recommendation:** Consolidate keyboard handling in one location. Either:
- Remove the keyboard handling from command-input and rely solely on command-root's window listener
- Or have command-input's handler stop propagation to prevent the window listener from also handling it

---

## Warnings

### 3. CommandItem generates a new ID on every render when not memoized

**Location:** `command-item.tsx`, line 81

```typescript
const itemId = React.useMemo(() => generateId('item'), []);
```

**Problem:** While useMemo prevents regeneration within a component instance, if the parent re-renders and causes CommandItem to remount (e.g., if the list is not using stable keys), items will get new IDs and re-register with the store, causing flickering and loss of selection state.

**Recommendation:** Consider deriving the ID from the `value` prop which is already required to be unique, e.g., `const itemId = \`item-${value}\``. This ensures stability across remounts.

---

### 4. No debouncing on search input for filter operations

**Location:** `command-input.tsx`, lines 81-90

```typescript
const handleChangeText = React.useCallback(
  (text: string) => {
    store.setSearch(text);
    onValueChange?.(text);
  },
  [store, onValueChange]
);
```

**Problem:** Every keystroke triggers a full refilter operation. The `refilter()` function in command-store.ts iterates over all items and applies the filter function, which is O(n) where n is the number of items.

**Impact:** For large command palettes (500+ items) or complex custom filter functions, this could cause input lag on slower devices.

**Recommendation:** Add optional debouncing for the search input. Consider adding a `debounceMs` prop that defaults to 0 for instant filtering but allows users to opt into debounced filtering for large lists.

---

### 5. Missing aria-activedescendant for proper screen reader navigation

**Location:** `command-input.tsx`, lines 165-171

```typescript
{...(Platform.OS === 'web' && {
  'data-cmdk-input': '',
  role: 'combobox',
  'aria-expanded': true,
  'aria-autocomplete': 'list',
  'aria-controls': listId,
})}
```

**Problem:** The input declares itself as a combobox and controls a listbox, but does not set `aria-activedescendant` to point to the currently selected item. Screen reader users will not be informed which item is currently highlighted as they navigate.

**Recommendation:** Add `aria-activedescendant` that references the ID of the currently selected CommandItem. This requires CommandItem to have a stable, predictable ID (see issue #3).

---

### 6. Native platform scroll-into-view not implemented

**Location:** `command-list.tsx`, lines 95-121

```typescript
React.useEffect(() => {
  if (Platform.OS !== 'web' || !selectedValue) return;
  // ... web-only scrollIntoView implementation
}, [selectedValue]);
```

**Problem:** The scroll-into-view behavior is web-only. On native platforms (iOS/Android), when navigating with arrow keys (if connected keyboard) or when the selection changes programmatically, the selected item may be scrolled out of view.

**Recommendation:** For native platforms, use `ScrollView.scrollTo()` or measure item positions with `onLayout` to implement scroll-into-view behavior.

---

### 7. Keywords array causes re-registration on every render

**Location:** `command-item.tsx`, lines 103-120

```typescript
const keywordsKey = JSON.stringify(keywords);

React.useEffect(() => {
  const unregister = store.registerItem({...});
  return unregister;
}, [store, itemId, value, keywordsKey, groupContext?.id, disabled, handleSelect]);
```

**Problem:** While `JSON.stringify(keywords)` helps with array reference stability, this approach has two issues:
1. JSON.stringify is called on every render, which is inefficient
2. If consumers pass `keywords={['a', 'b']}` inline (common pattern), it still works but relies on this workaround

**Recommendation:** Document that keywords should be memoized by consumers, or use a more efficient comparison method like a custom `useDeepCompareMemo` hook.

---

## Suggestions

### 8. Consider FlashList for very large command palettes

The current implementation uses ScrollView for native and a native div for web. For command palettes with hundreds of items, virtualization would significantly improve performance.

**Recommendation:** For native platforms, consider conditionally using FlashList or FlatList when the item count exceeds a threshold. The architecture already supports this since items register themselves.

---

### 9. Missing escape key handling in CommandInput for dialog dismissal

**Location:** `command-input.tsx`

The `getListKeyboardAction` returns `'escape'` for the Escape key, but the handler in CommandInput does not act on it:

```typescript
switch (action) {
  case 'next': ...
  case 'previous': ...
  // 'escape' case is not handled
}
```

**Recommendation:** While CommandDialog handles Escape separately, inline Command components may want an `onEscape` callback prop for consistency.

---

### 10. Loading state is not integrated with filter count

**Location:** `command-empty.tsx`

When loading is true, the CommandEmpty component may still show "No results" briefly before results load.

**Recommendation:** CommandEmpty should also check loading state and not display when `loading === true`.

---

### 11. Store options mutation could be cleaner

**Location:** `command-store.ts`, line 391

```typescript
Object.assign(options, newOptions);
```

**Problem:** Mutating the options object in place is an unusual pattern that could lead to subtle bugs if the options object is referenced elsewhere.

**Recommendation:** Create a new options object instead of mutating: `options = { ...options, ...newOptions }`.

---

### 12. Type export inconsistency

**Location:** `index.ts`

Some internal types are exported (like `CommandStoreOptions`) while others that might be useful for consumers (like `CommandItemData` for custom filtering) are not.

**Recommendation:** Review which types should be part of the public API and export them consistently.

---

## What's Done Well

1. **Clean Store Architecture:** The `useSyncExternalStore` pattern is correctly implemented for the core state management, providing a solid foundation for external state that React can subscribe to efficiently.

2. **Batching for Cascading Updates:** The batch() function in command-store.ts prevents multiple emits during related state changes (e.g., registering an item + refiltering + selecting first), which is a thoughtful optimization.

3. **Comprehensive Test Coverage:** The test files cover store behavior, filtering, and component integration well. The tests are well-organized and test meaningful behaviors.

4. **Thoughtful API Design:** The API closely matches cmdk which is a well-designed, battle-tested library. Props are semantic (value, keywords, disabled) rather than implementation-focused.

5. **Cross-Platform Considerations:** The code correctly uses `Platform.select()` and `Platform.OS` checks to provide appropriate implementations for web vs native, including proper ARIA attributes on web.

6. **Proper Cleanup:** All useEffect hooks return cleanup functions for event listeners and store registrations, preventing memory leaks.

7. **Documentation:** The README is comprehensive with clear examples, API reference, and notes on differences from cmdk.

8. **Accessibility Basics:** Good use of accessibilityRole, accessibilityState, and ARIA attributes. The component structure follows the WAI-ARIA combobox pattern.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Fix selector re-render issue - Critical for performance with larger item lists
2. **[Critical]** Resolve duplicate keyboard handling - Potential for confusing bugs
3. **[High]** Add aria-activedescendant - Important accessibility gap
4. **[High]** Stabilize item IDs based on value - Prevents potential remount issues
5. **[Medium]** Consider adding search debouncing option - Performance enhancement for large lists
6. **[Medium]** Implement native scroll-into-view - Complete cross-platform parity
7. **[Low]** Integrate loading state with CommandEmpty - UX polish
