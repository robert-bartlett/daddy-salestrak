# Display Components Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/`
**Files Reviewed:** avatar.tsx, badge.tsx, breadcrumb.tsx, icon.tsx, kbd.tsx, message.tsx, skeleton.tsx, spinner.tsx, text.tsx, separator.tsx

---

## Summary

The display components are generally well-architected with good use of TypeScript, CVA for variants, and consistent patterns across the library. The components follow React Native best practices for cross-platform development and make appropriate use of Reanimated for animations. However, there are several accessibility gaps, a few API inconsistencies, and some performance optimizations that could be applied.

**Overall Quality:** Good - solid foundation with room for targeted improvements.

---

## Critical Issues

### 1. Skeleton - Missing Accessibility Announcements for Loading States

**File:** `skeleton.tsx`
**Lines:** 27-68

The Skeleton component has no accessibility attributes to indicate loading state to screen readers. Users relying on assistive technology will not know that content is loading.

```tsx
// Current (problematic)
<Animated.View
  ref={ref}
  style={animatedStyle}
  className={cn('rounded-md bg-muted', className)}
  {...props}
/>

// Should include
accessibilityRole="progressbar"
accessibilityLabel="Loading content"
accessibilityState={{ busy: true }}
```

**Impact:** Screen reader users cannot perceive that content is loading.

### 2. Avatar - Missing Alt Text Support

**File:** `avatar.tsx`
**Lines:** 51-65

`AvatarImage` does not enforce or encourage `alt` text for accessibility. Images without alt text are inaccessible to screen reader users.

```tsx
// AvatarImage should enforce alt prop
type AvatarImageProps = AvatarPrimitive.ImageProps & {
  alt: string; // Make required, not optional
};
```

**Impact:** Non-decorative avatar images will lack descriptions for assistive technology users.

---

## Warnings

### 1. Icon - Decorative vs Meaningful Icons Not Enforced

**File:** `icon.tsx`
**Lines:** 57-83

The Icon component does not differentiate between decorative icons (which should be hidden from screen readers) and meaningful icons (which need labels). There is no `decorative` or `accessibilityLabel` prop pattern.

```tsx
// Suggested pattern
type IconProps = LucideProps & {
  as: LucideIcon;
  tone?: 'default' | 'muted' | 'destructive' | 'primary' | 'secondary';
  /** If true, icon is hidden from screen readers */
  decorative?: boolean;
  /** Required when decorative is false */
  accessibilityLabel?: string;
};
```

### 2. Badge - Inconsistent Tone System

**File:** `badge.tsx`
**Lines:** 222-231

Badge uses `color` prop for semantic colors while other components (Text, Icon, Spinner) use `tone`. This inconsistency in naming makes the API harder to learn.

```tsx
// Badge uses: color?: 'grey' | 'red' | ...
// Text/Icon/Spinner use: tone?: 'default' | 'muted' | 'destructive' | ...
```

Consider aligning nomenclature across components or documenting the distinction clearly.

### 3. Spinner - Tone Inconsistency with Icon

**File:** `spinner.tsx`
**Lines:** 22-24

Spinner adds `'primary-foreground'` to its tone options which Icon does not have. This creates an inconsistent API.

```tsx
// Spinner tone includes 'primary-foreground'
// Icon tone does not
```

### 4. Breadcrumb - Complex Child Processing May Cause Performance Issues

**File:** `breadcrumb.tsx`
**Lines:** 90-156

The `collapseChildren` function recursively processes children on every render. For breadcrumbs with many items, this could cause performance overhead. Consider memoizing the collapsed children.

```tsx
// Current - processes on every render
const processedChildren =
  maxItems !== undefined ? collapseChildren(children, maxItems, ellipsisProps) : children;

// Should memoize
const processedChildren = React.useMemo(
  () => maxItems !== undefined ? collapseChildren(children, maxItems, ellipsisProps) : children,
  [children, maxItems, ellipsisProps]
);
```

### 5. Message - Dismissable Default is Misleading

**File:** `message.tsx`
**Lines:** 75-77, 126

`dismissable` defaults to `true` but the dismiss button only renders when `onDismiss` is also provided. The prop name suggests the message can be dismissed by default, which is misleading.

```tsx
// Current API - confusing
dismissable?: boolean;  // defaults to true
onDismiss?: () => void; // dismiss button only shows when BOTH are truthy

// Consider: just use onDismiss presence to determine dismissability
```

---

## Suggestions

### 1. Memoization Opportunities

**Icon Component** - Could benefit from `React.memo` since it is a pure presentation component:
```tsx
const Icon = React.memo(function Icon({ ... }: IconProps) {
  // ...
});
```

**Badge, Message, Kbd** - These are good candidates for `React.memo` to prevent unnecessary re-renders when parent components update.

### 2. Text - Missing `numberOfLines` Convenience Prop

**File:** `text.tsx`

The Text component could expose a typed `truncate` or `lines` variant for common truncation patterns:

```tsx
// Suggestion
truncate?: boolean | number; // true = 1 line, number = that many lines
```

### 3. Separator - Consider Adding Semantic Spacing Tokens to className

**File:** `separator.tsx`

The `length` prop uses inline styles. Consider whether this could be converted to className-based approach using design tokens for consistency.

### 4. Kbd - Platform-Aware Key Symbols

**File:** `kbd.tsx`
**Lines:** 8-28

The `KEY_SYMBOLS` mapping is Mac-centric (using symbols like Command, Option). Consider platform detection to show appropriate symbols (e.g., "Ctrl" on Windows/Linux vs Command symbol on Mac).

### 5. Avatar - Consider Image Loading States

**File:** `avatar.tsx`

The Avatar component relies on `@rn-primitives/avatar` for image loading, but there is no loading state animation. Consider adding a subtle fade-in or skeleton while the image loads to improve perceived performance.

### 6. Breadcrumb - Consider Semantic HTML on Web

**File:** `breadcrumb.tsx`

While ARIA roles are applied, the web version could benefit from using semantic `<nav>`, `<ol>`, and `<li>` elements via conditional rendering or slot patterns for better SEO and screen reader support.

### 7. Missing Central Barrel Export

Several complex components have their own `index.ts` files (entity-selector, data-table, etc.), but these display components are exported individually. Consider adding a central export strategy for consistent import patterns.

---

## What's Done Well

1. **Consistent CVA Pattern:** All components use `class-variance-authority` consistently for variant management. The pattern of separating container variants, text variants, and icon variants (as seen in Badge) is excellent for maintainability.

2. **Cross-Platform Considerations:** Platform-specific styles using `Platform.select()` are well-implemented. Reanimated used appropriately for native animations with CSS fallbacks on web. `cssInterop` properly configured for Icon component.

3. **TypeScript Strictness:** Props are well-typed with clear constraints. Discriminated unions used in Badge (`asChild` disabling `icon` and `onDismiss`). Exported types alongside components.

4. **Accessibility Patterns:** Proper use of `accessibilityRole` attributes. ARIA labels on interactive elements (Badge dismiss, Message dismiss, Breadcrumb ellipsis). `aria-hidden` correctly applied to decorative separators.

5. **Design Token Usage:** Consistent use of semantic color tokens (`text-foreground`, `bg-muted`, etc.). Spacing follows the design system scale. Text component provides comprehensive variant coverage.

6. **TextClassContext Pattern:** The `TextClassContext` pattern for propagating text styles to children is elegant and allows components like Button and Badge to style nested text without tight coupling.

7. **Documentation:** JSDoc comments on public components. Clear code comments explaining non-obvious decisions. `displayName` set on all components for debugging.

8. **Ref Forwarding:** All components properly forward refs using `React.forwardRef`, enabling composition and imperative access when needed.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Add accessibility attributes to Skeleton component
2. **[Critical]** Enforce or encourage alt text on AvatarImage
3. **[High]** Add decorative/accessible icon pattern to Icon component
4. **[High]** Memoize Breadcrumb collapse processing
5. **[Medium]** Align tone/color naming conventions across components
6. **[Low]** Consider React.memo for pure presentation components
