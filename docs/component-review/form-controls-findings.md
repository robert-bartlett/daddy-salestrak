# Form Controls Component Review Findings

**Reviewed:** 2026-01-27
**Path:** `/Users/brennon/dev/design/design-prototypes/components/ui/`
**Files Reviewed:** button.tsx, button-group.tsx, checkbox.tsx, input.tsx, radio-group.tsx, select.tsx, switch.tsx, textarea.tsx, toggle.tsx

---

## Summary

The form control components demonstrate solid foundational work with good platform-specific handling, consistent haptic feedback patterns, and thoughtful accessibility attributes. The codebase shows attention to React Native best practices including proper use of Reanimated for animations, touch target sizing via hitSlop, and throttled haptic feedback.

However, there are several architectural inconsistencies across components, missing accessibility features, potential performance issues, and gaps in form integration readiness that should be addressed before the library is production-ready.

---

## Critical Issues

### 1. Input/Textarea Missing `disabled` Accessibility State Announcement

**Files:** `input.tsx:63-64`, `textarea.tsx:97-98`

**Problem:** The `Input` component sets `accessibilityState={{ disabled: isDisabled }}` but does not set `aria-disabled` for web, creating inconsistent screen reader behavior across platforms. The `Textarea` does not set `accessibilityState` at all.

**Impact:** Screen reader users on web may not be informed that a field is disabled.

**Recommendation:** Add `aria-disabled={isDisabled}` for web parity on both components and add `accessibilityState={{ disabled: props.editable === false }}` to Textarea.

---

### 2. Switch Missing accessibilityRole on Native

**File:** `switch.tsx:22-31`

**Problem:** The native `RNSwitch` branch does not set `accessibilityRole="switch"`. While iOS/Android native switches have implicit roles, explicit declaration ensures consistency with the web implementation.

**Impact:** Inconsistent accessibility semantics across platforms.

**Recommendation:** Add `accessibilityRole="switch"` to the native RNSwitch render path.

---

### 3. Select Components Missing Keyboard Navigation Support

**File:** `select.tsx`

**Problem:** The Select component relies entirely on the `@rn-primitives/select` primitive but provides no documentation or props for keyboard navigation customization. On web, users expect to navigate options with arrow keys, and Tab/Escape behavior should be predictable.

**Impact:** Keyboard-only users may have difficulty using the select on web.

**Recommendation:** Verify the primitive handles keyboard navigation correctly, and document any required consumer setup. Consider exposing `onKeyDown` handlers if customization is needed.

---

## Warnings

### 1. Inconsistent Controlled/Uncontrolled Patterns

**Files:** `switch.tsx:8-11`, `radio-group.tsx:38-40`

**Problem:** The `Switch` component supports both `checked`/`onCheckedChange` and `value`/`onValueChange` prop pairs. The `RadioGroupItem` accepts a `checked` prop but also reads from `aria-checked`. This dual-API approach can lead to confusion and subtle bugs when consumers mix patterns.

**Impact:** Consumers may accidentally create half-controlled components leading to stale state.

**Recommendation:** Choose a single canonical API (prefer `checked`/`onCheckedChange` for boolean controls to match React patterns) and deprecate the alternatives with clear migration guidance.

---

### 2. Input Component Should Support Uncontrolled Pattern for Performance

**File:** `input.tsx`

**Problem:** Per React Native best practices, controlled `TextInput` components (where `value` is passed on every keystroke) can cause performance issues on low-end devices due to the JS-Native bridge roundtrip on each character. The component doesn't provide guidance or utilities for uncontrolled usage.

**Impact:** High-volume text entry scenarios may feel sluggish on slower devices.

**Recommendation:** Document the performance tradeoff and consider adding an `uncontrolled` prop or separate `UncontrolledInput` variant that uses `defaultValue` and refs for value access.

---

### 3. ButtonGroup Cloning Children Without Preserving Refs

**File:** `button-group.tsx:122-125`

**Problem:** `React.cloneElement` in ButtonGroup only merges `className` but does not compose refs. If a child Button has a ref, it could be lost.

**Impact:** Consumers forwarding refs to grouped buttons may find refs don't work as expected.

**Recommendation:** Use a ref composition utility when cloning elements that may have forwarded refs.

---

### 4. Missing `accessibilityLabel` Props on Form Controls

**Files:** All form control files

**Problem:** None of the form controls accept or encourage an `accessibilityLabel` prop in their type definitions or documentation. While labels can be provided via context or parent components, explicit support would improve ergonomics.

**Impact:** Consumers may forget to add labels, resulting in inaccessible forms.

**Recommendation:** Add `accessibilityLabel?: string` to component props and document its importance. Consider requiring it via TypeScript for critical components.

---

### 5. Checkbox/RadioGroupItem Wrapping in Animated.View Breaks Layout Flow

**Files:** `checkbox.tsx:150-153`, `radio-group.tsx:136-139`

**Problem:** On native, the Checkbox and RadioGroupItem wrap their content in an `Animated.View` for scale animation. This extra wrapper can break flex layouts and margin/padding expectations when these components are used inline.

**Impact:** Layout inconsistencies when components are placed in flex containers.

**Recommendation:** Apply animation styles directly to the root pressable instead of wrapping, or ensure the wrapper has `style={{ alignSelf: 'flex-start' }}` to prevent layout expansion.

---

## Suggestions

### 1. Standardize Haptic Feedback Configuration

**Observation:** Button, Checkbox, RadioGroupItem, and Toggle all have identical haptic feedback patterns with copy-pasted constants and logic. This violates DRY.

**Recommendation:** Extract a `useHapticPress` hook that encapsulates:
- Throttle timing
- Platform detection
- Haptic style selection
- Error handling

This would reduce code duplication and ensure consistent behavior updates library-wide.

---

### 2. Add Form Integration Utilities

**Observation:** None of the form controls have built-in support for form libraries (react-hook-form, formik) or native form submission patterns.

**Recommendation:** Consider adding:
- A `name` prop to all form controls for form state management
- A `FormField` wrapper component that handles label, error message, and description
- Documentation for integrating with popular form libraries

---

### 3. Consolidate Platform-Specific Style Handling

**Observation:** Every component uses `Platform.select()` inline within className strings, making the code verbose and harder to maintain.

**Recommendation:** Create a `platformStyles()` utility that accepts `{ native?: string; web?: string; ios?: string; android?: string }` and returns the appropriate class string.

---

### 4. Add Size Variant to Checkbox and RadioGroupItem

**Observation:** Button, Toggle, and Select have `size` variants, but Checkbox and RadioGroupItem are fixed at `size-4`. Form layouts often need different sizes.

**Recommendation:** Add consistent `size` prop (`sm`, `default`, `lg`) to Checkbox and RadioGroupItem matching other form controls.

---

### 5. SelectTrigger Missing Disabled Touch Feedback

**Observation:** When `disabled` is true, SelectTrigger only applies `opacity-50` but continues to respond visually to touch on native.

**Recommendation:** Add `disabled && 'pointer-events-none'` for web and consider setting `disabled` on the underlying pressable for native.

---

### 6. Consider Adding Error Message Slots

**Observation:** Input and Textarea have `invalid` props for error styling, but there's no built-in way to render error messages with proper accessibility linking (aria-describedby).

**Recommendation:** Either expand these components to accept `errorMessage` with automatic ID linking, or create a `FormField` wrapper component that handles this pattern.

---

### 7. Textarea Focus State Inconsistency

**Files:** `textarea.tsx:56, 83`

**Observation:** Textarea manually tracks `isFocused` state for native platforms to apply border styles, but Input relies purely on CSS. This inconsistency could lead to different focus behaviors.

**Recommendation:** Either both components should use the same pattern, or document why they differ.

---

### 8. Add `loading` State to Button

**Observation:** Button has no built-in loading state, which is common for form submission buttons.

**Recommendation:** Add an optional `loading?: boolean` prop that shows a spinner and disables interaction.

---

## What's Done Well

1. **Excellent Platform-Specific Handling:** Web gets CSS transitions and focus-visible rings while native gets Reanimated scale animations and haptic feedback. The `Platform.select()` usage is consistent and thoughtful.

2. **Proper Touch Target Sizing:** All interactive components use `hitSlop` to ensure 44pt minimum touch targets, following iOS Human Interface Guidelines.

3. **Thoughtful Animation Implementation:** The use of Reanimated with spring configs tuned for "native feel" (`damping: 15, stiffness: 400`) shows care for UX.

4. **Haptic Feedback with Throttling:** The haptic implementation properly throttles to prevent "buzz spam" and silently catches errors for simulators/unsupported devices.

5. **Strong TypeScript Usage:** Props are well-typed with `VariantProps` from class-variance-authority ensuring type safety for variants.

6. **Consistent Variant Architecture:** The use of CVA for variants provides a scalable, maintainable pattern.

7. **Good Documentation Comments:** Components have JSDoc comments explaining ref forwarding, platform differences, and usage notes.

8. **Accessibility Foundations:** Components set appropriate `accessibilityRole`, `accessibilityState`, and web ARIA attributes.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Fix Input/Textarea accessibility state announcements
2. **[Critical]** Add accessibilityRole to native Switch
3. **[Critical]** Verify Select keyboard navigation
4. **[High]** Resolve controlled/uncontrolled API inconsistencies
5. **[High]** Fix ButtonGroup ref composition
6. **[Medium]** Extract shared haptic feedback hook
7. **[Medium]** Add size variants to Checkbox/RadioGroupItem
8. **[Medium]** Add form integration utilities
9. **[Low]** Add loading state to Button
10. **[Low]** Consolidate platform style helpers
