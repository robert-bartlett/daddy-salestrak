# Layout Components Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/layout/`
**Files Reviewed:** box.tsx, center.tsx, container.tsx, frame.tsx, grid.tsx, spacer.tsx, stack.tsx, surface.tsx, layout-constants.ts, index.ts

---

## Summary

The layout components provide a solid foundation for a React Native component library with good TypeScript typing, semantic prop naming, and proper use of design tokens. The architecture correctly enforces zero-styling outside the library by omitting `className` and `style` from props. However, there are several areas that need attention, particularly around performance optimization (missing memoization), accessibility gaps, API inconsistencies, and some cross-platform edge cases.

---

## Critical Issues

### 1. Missing Memoization on All Components

**Impact:** Can cause cascading re-renders in large component trees

All layout components lack `React.memo()` wrappers. Layout components are foundational and used everywhere in an app. Without memoization, any parent re-render will cause all child layout components to re-render, even if their props haven't changed.

**Files affected:** All component files

**Current pattern:**
```tsx
const Box = React.forwardRef<View, BoxProps>(
  ({ padding, ... }, ref) => {
    // ...
  }
);
```

**Recommended pattern:**
```tsx
const Box = React.memo(
  React.forwardRef<View, BoxProps>(({ padding, ... }, ref) => {
    // ...
  })
);
```

### 2. Grid Native Implementation Creates Unnecessary Objects on Every Render

**Impact:** Performance issue causing garbage collection pressure

**File:** `grid.tsx` (lines 74-81)

The native Grid implementation creates new style objects on every render:

```tsx
const containerStyle: ViewStyle = gapValue > 0 ? { margin: -halfGap } : {};
const cellStyle: ViewStyle = {
  flexBasis: basis as `${number}%`,
  maxWidth: basis as `${number}%`,
  padding: halfGap,
};
```

These should be memoized with `useMemo` to avoid creating new objects on each render, which triggers unnecessary re-layouts on native.

---

## Warnings

### 1. No Accessibility Roles on Semantic Containers

**Impact:** Screen reader users may not understand layout structure

**Files affected:** surface.tsx, container.tsx, box.tsx

Surface, Container, and Box components that often represent semantic groupings should consider supporting an `accessibilityRole` prop or defaulting to appropriate roles when semantically meaningful. Currently, all components render plain Views without accessibility hints.

**Recommendation:** Add optional `accessibilityRole` prop forwarding:
```tsx
type SurfaceProps = {
  accessibilityRole?: 'region' | 'group' | 'article' | 'section';
  accessibilityLabel?: string;
  // ...
};
```

### 2. Box `background` Prop Type Allows Arbitrary Strings

**Impact:** Breaks the design system constraint principle

**File:** `box.tsx` (line 35)

```tsx
background?: BackgroundToken | string;
```

Allowing arbitrary strings (`background="#ff0000"`) defeats the purpose of a constrained design system. Consumers can bypass design tokens entirely.

**Recommendation:** Either:
1. Remove `| string` to enforce token usage
2. Add a separate prop like `customBackground` that's clearly marked as an escape hatch

### 3. Inconsistent Prop Naming Between Components

**Impact:** API ergonomics and learning curve

**Inconsistencies found:**
- `fill` prop behavior differs:
  - `Box`: `fill?: boolean` (applies `flex-1 self-stretch`)
  - `Frame`: `fill?: true | 'width' | 'height' | 'both'` (more granular)
  - `Center`: `fill?: boolean`
- `direction` naming:
  - `Frame`: uses `row` | `column`
  - `Stack`: uses `vertical` | `horizontal`

**Recommendation:** Standardize on one naming convention. Consider using `vertical`/`horizontal` consistently as it's more semantic than `row`/`column`.

### 4. Stack Component Not Exported (But Internal Stack Used)

**Impact:** Confusing API and potential namespace collision

**File:** `stack.tsx` (lines 72-74)

The comment states Stack is not exported to avoid Expo Router conflicts. This is reasonable but consider renaming internal Stack to `StackBase` for clarity.

### 5. Grid `cellClassName` Prop Allows Styling Escape Hatch

**Impact:** Breaks zero-styling principle

**File:** `grid.tsx` (lines 24-28)

```tsx
cellClassName?: string;
```

This allows consumers to inject arbitrary Tailwind classes, bypassing the constrained API.

**Recommendation:** Consider replacing with a typed `cellVariant` prop or removing this escape hatch.

---

## Suggestions

### 1. Add `gap` Support to Box Component

The `Box` component supports `padding` but not `gap`. For consistency with `Stack` and `Grid`, consider adding `gap` support for when Box is used as a flex container.

### 2. Consider Adding Margin Props to Box

`Box` has `padding` but no `margin` props. While margins can be contentious in design systems, explicit `margin` props might be useful.

### 3. Add Debug Mode for Layout Components

Consider adding a development-only debug mode that renders borders/backgrounds on layout components to visualize the layout structure.

### 4. Test Coverage Could Be More Thorough

Current tests only verify components render. Consider adding:
- Prop validation tests
- Snapshot tests for className generation
- Platform-specific tests for Grid (web vs native)
- Accessibility tests

### 5. Add JSDoc Comments to All Components

`Grid` has excellent JSDoc documentation explaining platform differences. Other components would benefit from similar documentation, especially `Frame` and `Center`.

---

## What's Done Well

1. **Excellent TypeScript Strict Mode Compliance:** All components use proper TypeScript with explicit prop types, `as const` assertions, and proper generic forwarding for refs.

2. **Proper Design Token Usage:** The `layout-constants.ts` file provides a single source of truth for spacing tokens. All components consistently use these tokens.

3. **`className` and `style` Props Correctly Omitted:** All components properly omit these props from `ViewProps`:
```tsx
type BoxProps = Omit<ViewProps, 'className' | 'style'> & { ... };
```
This enforces the zero-styling-outside-library principle at the type level.

4. **Semantic Prop Names:** Props like `padding`, `gap`, `align`, `justify`, `fill`, `rounded` describe intent, not implementation.

5. **Cross-Platform Considerations:**
   - `Container` correctly handles web vs native max-width strategies
   - `Surface` uses Android-specific elevation
   - `Grid` documents and handles platform differences explicitly

6. **Ref Forwarding on All Components:** Every component properly uses `React.forwardRef`.

7. **displayName Set on All Components:** All components set `displayName`, which improves React DevTools debugging.

8. **Clean Export Structure:** The barrel export in `index.ts` cleanly re-exports all components. The decision to not export `Stack` directly (to avoid Expo Router conflicts) shows thoughtfulness.

9. **Grid Platform Documentation:** The Grid component has excellent JSDoc documentation explaining platform differences. This should be the standard for all components.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Add `React.memo()` to all components - Quick win, high impact
2. **[Critical]** Memoize Grid style objects - Prevents native performance issues
3. **[High]** Reconsider `background?: string` escape hatch in Box - Architectural decision
4. **[High]** Add accessibility role support - Important for inclusive design
5. **[Medium]** Standardize fill/direction prop naming - API consistency
6. **[Medium]** Remove or restrict `cellClassName` in Grid - Enforce design system constraints
7. **[Low]** Expand test coverage - Long-term maintainability
8. **[Low]** Add JSDoc to all components - Developer experience
