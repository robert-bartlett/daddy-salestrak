# Entity Selector Component Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/entity-selector/`
**Files Reviewed:** All component files + hooks

## Summary

The `entity-selector/` component is a well-architected, composable multi-select dropdown built on a compound component pattern with React Context. The codebase demonstrates solid TypeScript practices, thoughtful accessibility considerations for web, and clean separation of concerns. However, there are several performance concerns around list rendering, missing memoization, incomplete native accessibility support, and some edge cases in keyboard navigation that warrant attention.

**Overall Assessment**: Good foundation with solid architecture. Needs performance optimization for large lists and improved accessibility on native platforms.

---

## Critical Issues

### 1. No Virtualization for Entity Lists

**Files**:
- `entity-selector-pool.tsx` (lines 82-89)
- `entity-selector-selected.tsx` (lines 71-82)

**Problem**: Both `EntitySelectorPool` and `EntitySelectorSelected` render lists using `.map()` directly. For pools with many entities (e.g., a company directory with 500+ members), this will cause:
- Slow initial render and re-renders
- Memory bloat from mounting all items
- Scroll jank on lower-end devices

**Current Code** (`entity-selector-pool.tsx`):
```tsx
{filteredItems.map((item) => (
  <EntitySelectorItem
    key={item.id}
    entity={item}
    poolId={value}
    actionLabel={badge?.label}
    onAction={onItemAction}
  />
))}
```

**Recommendation**: Use `FlatList` or `FlashList` (from `@shopify/flash-list`) for any list that could exceed 20-30 items. FlashList provides better performance with minimal API changes.

### 2. EntitySelectorItem Not Memoized

**File**: `entity-selector-item.tsx`

**Problem**: `EntitySelectorItem` uses `forwardRef` but is not wrapped with `React.memo()`. Since items consume context via `useEntitySelector()`, every context update (search changes, selection changes, highlight changes) triggers re-renders of ALL items, not just the affected ones.

**Impact**: With 100 items, typing in search causes 100 component re-renders per keystroke.

**Recommendation**: Wrap with `React.memo()` and ensure `useEntitySelectorIsHighlighted` subscription is granular:

```tsx
const EntitySelectorItem = React.memo(
  React.forwardRef<View, EntitySelectorItemProps>(/* ... */)
);
```

Consider splitting context into separate providers for selections, search, and highlight state to enable more granular subscriptions.

### 3. Search Filtering Runs Multiple Times Per Render

**Files**:
- `entity-selector-pool.tsx` (line 55)
- `entity-selector-empty.tsx` (line 39)
- `entity-selector-root.tsx` (line 186)

**Problem**: `filterEntityItems()` is called multiple times per render cycle:
1. In `EntitySelectorPool` to render items
2. In `EntitySelectorEmpty` to check if empty
3. In `getNavigableItems()` for keyboard navigation

**Recommendation**: Compute filtered items once in the root component or via a dedicated hook and expose through context:

```tsx
// In context
filteredItems: Record<string, EntityItemConfig[]>; // keyed by poolId
```

---

## Warnings

### 4. Web-Only ARIA Pattern, Missing Native Accessibility

**Files**:
- `entity-selector-item.tsx` (lines 97-105)
- `entity-selector-pool.tsx` (lines 61-68)
- `entity-selector-input.tsx` (lines 121-122)

**Problem**: ARIA attributes (`role`, `aria-selected`, `aria-activedescendant`, `aria-controls`) are only applied on web via `Platform.OS === 'web'` checks. Native (iOS/Android) relies only on basic `accessibilityRole`.

**Missing on native**:
- Selection state announcements when navigating with keyboard
- Screen reader indication of which item is highlighted
- No `accessibilityLiveRegion` for search result count changes
- No announcement when items are selected/deselected

**Recommendation**: Add proper native accessibility:

```tsx
// For items
accessibilityLabel={`${entity.title}${selected ? ', selected' : ''}`}
accessibilityHint="Double tap to toggle selection"

// For result counts - announce changes
<View accessibilityLiveRegion="polite" accessibilityLabel={`${filteredItems.length} results`}>
```

### 5. Keyboard Navigation Hook Not Cleaning Up on Pool Change

**File**: `entity-selector-input.tsx` (lines 81-97)

**Problem**: The `navigableItems` memo depends on `getNavigableItems()` which is called fresh each render. When `activePool` changes, the highlight resets (good), but if a user quickly switches tabs while arrow-keying, there could be a brief moment where `highlightedId` references an item from the previous pool.

**Recommendation**: Ensure `navigableItems` is always computed synchronously with the current `activePool` state, not via a callback that could capture stale closures.

### 6. Missing Error Boundary

**Problem**: If any entity data is malformed (e.g., missing `id` or `title`), the component will crash. No error boundary wraps the entity rendering.

**Recommendation**: Add defensive checks and consider an error boundary:

```tsx
// In filterEntityItems
if (!item.id || !item.title) {
  console.warn('EntitySelector: Item missing required fields', item);
  return false;
}
```

### 7. Context Value Object Recreation

**File**: `entity-selector-root.tsx` (lines 225-265)

**Problem**: While `useMemo` is used for the context value, the dependency array includes `highlightedId` which changes on every keyboard navigation. This recreates the context value object, triggering re-renders of all context consumers.

**Impact**: Every arrow key press recreates the entire context value object.

**Recommendation**: Split context into stable (config, methods) and volatile (selections, highlight) parts:

```tsx
const EntitySelectorMethodsContext = React.createContext(/* stable methods */);
const EntitySelectorStateContext = React.createContext(/* volatile state */);
```

---

## Suggestions

### 8. Search Debouncing

**File**: `entity-selector-input.tsx`

**Problem**: Search updates state immediately on every keystroke. For large datasets, this creates unnecessary work.

**Recommendation**: Consider debouncing the search state update (150-300ms) or using `useDeferredValue`:

```tsx
const deferredSearch = React.useDeferredValue(search);
// Use deferredSearch for filtering
```

### 9. Haptic Feedback Only on iOS

**File**: `entity-selector-root.tsx` (line 126)

**Current Code**:
```tsx
if (Platform.OS === 'ios' && haptics) {
```

**Suggestion**: Android also supports haptic feedback via `expo-haptics`. Consider enabling on Android as well, possibly with different intensity.

### 10. Missing `maxHeight` Constraint on Content

**File**: `entity-selector-content.tsx`

**Problem**: No maximum height is enforced on the popover content. With many items, the dropdown could extend beyond viewport bounds.

**Recommendation**: Add a `maxHeight` with `overflow: scroll` or make it configurable:

```tsx
className="max-h-[min(400px,70vh)] overflow-y-auto"
```

### 11. Type Safety: Event Handler Typing

**File**: `entity-selector-item.tsx` (lines 72-78)

**Current Code**:
```tsx
const handleAction = React.useCallback(
  (event: { stopPropagation?: () => void }) => {
```

**Suggestion**: Use proper event types instead of partial structural typing:

```tsx
import { GestureResponderEvent } from 'react-native';
const handleAction = React.useCallback(
  (event: GestureResponderEvent) => {
```

### 12. Consistent Component Export Pattern

**File**: `entity-selector-selected.tsx`

**Observation**: Most components use `forwardRef`, but `EntitySelectorSelected`, `EntitySelectorTabs`, `EntitySelectorAutoTabs`, and `EntitySelectorEmpty` do not. For consistency and future extensibility, consider using `forwardRef` throughout.

### 13. Web Keyboard Listener Scope

**File**: `hooks/use-list-keyboard-navigation.ts` (line 412)

**Problem**: The web keydown listener is attached to `window`, meaning it captures keyboard events globally. If multiple EntitySelectors are rendered, or other keyboard-navigable components exist, there could be conflicts.

**Recommendation**: Attach the listener to a specific container element rather than `window`, or ensure proper event cleanup and scoping via `stopPropagation`.

### 14. Consider Scroll-Into-View for Highlighted Items

**Problem**: When navigating with keyboard, if the highlighted item is outside the visible scroll area, the user cannot see what is highlighted.

**Recommendation**: Implement automatic scroll-into-view when `highlightedId` changes:

```tsx
useEffect(() => {
  if (highlightedId) {
    const element = document.getElementById(`entity-item-${highlightedId}`);
    element?.scrollIntoView({ block: 'nearest' });
  }
}, [highlightedId]);
```

---

## What's Done Well

1. **Excellent Compound Component Architecture:** The separation into Root, Trigger, Content, Input, Tabs, Pool, Item, Selected, Empty, and Footer creates a highly composable API. Consumers can easily customize layouts while the component handles complex state internally.

2. **Solid TypeScript Usage:** Discriminated union types for configs, proper generic typing in hooks, clear prop interfaces with good documentation.

3. **Thoughtful Web Accessibility:** Proper ARIA combobox pattern with `aria-activedescendant`, `tabIndex: -1` on items to maintain focus on input, correct `role="listbox"` and `role="option"` semantics.

4. **Clean State Management:** `useControllableState` hook enables both controlled and uncontrolled usage. Clear separation of selection, search, tab, and highlight state. Proper reset of transient state on popover close.

5. **Good Hook Extraction:** `useListKeyboardNavigation` is well-designed, reusable, and handles edge cases like disabled items and looping.

6. **Attention to UX Details:** Haptic feedback with throttling, auto-focus management after tab changes, search filtering includes keywords and ID matching, avatar fallback generation from title initials.

7. **Cross-Platform Considerations:** Platform-specific styling via `Platform.select()`, conditional ARIA attributes for web, proper handling of popover positioning differences.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Add `React.memo()` to `EntitySelectorItem` to prevent mass re-renders
2. **[Critical]** Implement list virtualization for `EntitySelectorPool` using FlatList or FlashList
3. **[High]** Centralize `filterEntityItems` computation to avoid redundant filtering
4. **[High]** Add native accessibility labels and announcements
5. **[Medium]** Split context into stable/volatile parts to reduce re-renders
6. **[Medium]** Add scroll-into-view for keyboard navigation
7. **[Medium]** Add maxHeight constraint to content container
8. **[Low]** Consider search debouncing for large datasets
9. **[Low]** Enable haptics on Android
