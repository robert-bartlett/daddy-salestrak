# DataTable Component Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/data-table/`
**Files Reviewed:** 13 files

## Summary

The DataTable component is a well-architected, composable table system built on TanStack Table. It demonstrates good patterns for React Native virtualization, sensible TypeScript types, and clean separation of concerns. However, there are several areas for improvement around performance optimization, accessibility, and cross-platform robustness.

---

## Critical Issues

### 1. Missing Row Memoization in FlatList

**File:** `data-table.tsx`
**Lines:** 176-231

The `renderRow` callback creates a new function reference on every render due to `React.useCallback` dependencies, but the bigger issue is that `renderItem` re-renders ALL visible rows when any state changes (selection, sorting). FlatList does not memoize items by default.

**Problem:** Every row re-renders when `extraData` changes (row selection, column visibility), causing O(n) re-renders for what should be O(1) operations.

**Recommendation:** Extract the row component and wrap it with `React.memo`:

```tsx
const MemoizedRow = React.memo(function DataTableRow({ ... }) {
  // row content
}, (prevProps, nextProps) => {
  return prevProps.row.id === nextProps.row.id &&
         prevProps.row.getIsSelected() === nextProps.row.getIsSelected();
});
```

### 2. No FlashList Option for Large Datasets

**File:** `data-table.tsx`
**Line:** 250

Using React Native's `FlatList` is acceptable for small-to-medium datasets, but for tables with 1000+ rows, FlashList (from Shopify) provides significantly better scroll performance through cell recycling.

**Recommendation:** Consider adding a `virtualization?: 'flatlist' | 'flashlist'` prop, or document the expected data size limits for optimal performance.

---

## Warnings

### 3. Potential Memory Leak: Callbacks Not Stabilized

**File:** `data-table-pagination.tsx`
**Line:** 59-66

The `handlePageSizeChange` callback depends on `table`, which is an object reference that changes on every parent render if not memoized upstream. This can cause unnecessary re-renders and potentially memory issues if the pagination component is used in a complex tree.

**File:** `data-table-toolbar.tsx`
**Lines:** 44

The `onChangeText` callback `(value) => column.setFilterValue(value)` creates a new function on every render. For controlled inputs, this causes the input to lose focus on some platforms.

**Recommendation:** Memoize filter input callbacks with `useCallback`.

### 4. Incomplete Accessibility for Screen Readers

**Files:** Multiple

- **data-table.tsx (lines 135, 153, 194, 212):** ARIA roles (`role="table"`, `role="row"`, `role="columnheader"`, `role="cell"`) are only applied on web via `Platform.OS === 'web'`. Native platforms (iOS/Android) need `accessibilityRole` for screen reader support.

- **data-table-column-header.tsx (line 75):** The Pressable has `accessibilityRole="button"` but no `accessibilityLabel` describing the sort action.

- **data-table-selection-column.tsx (line 24-28):** The indeterminate state falls back to unchecked visually (`checked={checked === 'indeterminate' ? false : checked}`), which means screen readers announce "unchecked" when some rows are selected. The comment acknowledges this but it should be prioritized.

**Recommendation:**
```tsx
// Add accessibilityRole for native platforms
{...(Platform.OS === 'web'
  ? { role: 'row' }
  : { accessibilityRole: 'none' })} // or appropriate role
```

### 5. getHeaderWidthStyle Missing Memoization Dependencies

**File:** `data-table.tsx`
**Lines:** 77-107

The `getHeaderWidthStyle` callback has an empty dependency array but internally accesses `getColumnMeta` which reads from column definitions. If column definitions change, stale closures could cause width calculation bugs.

**Recommendation:** Add relevant dependencies or ensure it's truly stable.

### 6. extraData Object Recreation

**File:** `data-table.tsx`
**Lines:** 242-245

```tsx
const listExtraData = React.useMemo(
  () => ({ rowSelection, columnVisibility }),
  [rowSelection, columnVisibility]
);
```

This is correctly memoized, but `rowSelection` and `columnVisibility` are state objects that change reference on every table state update. This means `extraData` changes frequently, triggering FlatList comparison checks on all items.

**Recommendation:** Consider using a more granular approach - only pass the specific selection keys that changed, or use a comparison function in memo.

---

## Suggestions

### 7. Consider Keyboard Navigation for Web

**File:** `data-table.tsx`

Tables on web typically support arrow key navigation between cells, Tab to move through interactive elements, and Enter/Space to activate. None of this is implemented.

**Recommendation:** Add a `keyboardNavigation` prop that enables arrow key navigation between cells on web.

### 8. Missing Column Resize Support

**File:** `data-table-types.ts`

The column meta supports `width`, `minWidth`, `maxWidth` but there's no mechanism for user-initiated column resizing, which is a common table feature.

**Recommendation:** Consider adding `enableResize?: boolean` to column meta and a resize handle component.

### 9. TextClassContext Provider Scope

**File:** `data-table.tsx`
**Line:** 248

The `TextClassContext.Provider` wraps the entire table, which is good, but the density config's `textSize` is applied globally. If a cell contains a component that sets its own text size, this could conflict.

**Recommendation:** Document that custom cell renderers should use `useContext(TextClassContext)` to respect density settings, or provide a `DataTableText` component.

### 10. Type Safety: Loose Meta Casting

**File:** `data-table-utils.ts`
**Lines:** 103-107

```tsx
export function getColumnMeta(
  column: { columnDef: { meta?: unknown } }
): DataTableColumnMeta | undefined {
  return column.columnDef.meta as DataTableColumnMeta | undefined;
}
```

This uses a type assertion without runtime validation. If a consumer passes invalid meta, there's no error until something breaks.

**Recommendation:** Consider a runtime check or Zod schema for development mode.

### 11. No Loading Skeleton Option

**File:** `data-table-loading.tsx`

The loading state shows a centered spinner, but skeleton rows that match the table layout would provide a better perceived performance experience.

**Recommendation:** Add a `loadingRows?: number` prop to render skeleton rows matching the expected data shape.

### 12. Pagination Assumes Row Selection Feature

**File:** `data-table-pagination.tsx`
**Lines:** 44, 72-75

The pagination always shows "X of Y row(s) selected" even if the table has no selection column. This could be confusing.

**Recommendation:** Conditionally render the selection count only when `table.options.enableRowSelection` is true.

---

## What's Done Well

1. **Excellent TypeScript typing:** The types in `data-table-types.ts` are well-designed with clear documentation. `DataTableColumnMeta`, `DataTableDensity`, and `DataTableActionItem` all use semantic naming and literal types.

2. **Clean composable architecture:** Following shadcn/ui patterns, each sub-component (pagination, toolbar, row actions) is independent and can be used a la carte.

3. **Smart density configuration:** The `DENSITY_CONFIG` constant centralizes all density-related values, making it easy to maintain and extend.

4. **Proper FlatList optimizations:** `getItemLayout` is correctly implemented for fixed-height rows, `removeClippedSubviews` is disabled on web (where it causes issues), and `windowSize`/`maxToRenderPerBatch` are tuned.

5. **Good documentation:** JSDoc comments explain component purpose, provide examples, and document edge cases.

6. **Semantic row press handling:** The `rowPressable` predicate function allows fine-grained control over which rows are interactive.

7. **Proper re-export strategy:** `index.ts` cleanly exports all public API and re-exports TanStack Table utilities consumers need, reducing import boilerplate.

8. **Development warnings:** `DataTableFilterInput` warns when filter config references non-existent columns, which aids debugging.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Add row memoization to prevent O(n) re-renders on selection changes
2. **[Critical]** Evaluate FlashList for large dataset support
3. **[High]** Add native accessibility roles (not just web)
4. **[High]** Stabilize filter input callbacks to prevent focus loss
5. **[Medium]** Add keyboard navigation support for web
6. **[Medium]** Fix indeterminate checkbox visual/announcement
7. **[Low]** Add skeleton loading rows option
8. **[Low]** Conditionally show selection count in pagination
