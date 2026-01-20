# Component Standards

Reference standards for building production-quality React Native components. Based on patterns established in `components/ui/button.tsx`.

---

# Part 1: Universal Standards

*Apply these to every component you build.*

---

## 1.1 Cross-Platform Handling

Use `Platform.select()` to apply platform-specific styles and behavior. Keep shared styles in the base, add platform differences as overrides.

```tsx
import { Platform } from 'react-native';

const styles = cn(
  'shared-styles-here',
  Platform.select({
    web: 'web-only-styles',
    native: 'ios-and-android-styles',
    ios: 'ios-only-styles',
    android: 'android-only-styles',
  })
);
```

**Guidelines:**
- Web needs hover/focus states, native does not
- Native needs touch feedback (animations), web uses CSS transitions
- Always test on both platforms after changes

---

## 1.2 Variant System

Use `class-variance-authority` for components with multiple visual variants.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  'base-styles-applied-to-all-variants',
  {
    variants: {
      variant: {
        default: 'default-variant-styles',
        secondary: 'secondary-variant-styles',
      },
      size: {
        default: 'default-size-styles',
        sm: 'small-size-styles',
        lg: 'large-size-styles',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ComponentProps = React.ComponentProps<typeof BaseComponent> &
  VariantProps<typeof componentVariants>;
```

**Guidelines:**
- Export variant definitions for reuse (e.g., text variants matching button variants)
- Always set `defaultVariants`
- Keep variant names consistent across components (default, secondary, destructive, outline, ghost)

---

## 1.3 Refs and TypeScript

Forward refs and provide proper TypeScript types.

```tsx
import { View } from 'react-native';

type ComponentProps = React.ComponentProps<typeof View> & {
  customProp?: boolean;
};

const Component = React.forwardRef<View, ComponentProps>(
  ({ className, customProp, ...props }, ref) => {
    return <View ref={ref} {...props} />;
  }
);

Component.displayName = 'Component';

export { Component };
export type { ComponentProps };
```

**Guidelines:**
- Always forward refs for composability
- Set `displayName` for better debugging
- Export both component and its props type
- Use `React.ComponentProps<typeof X>` to inherit base props

---

## 1.4 Memoization

Memoize callbacks passed to child components or used in effects.

```tsx
const handleSomething = React.useCallback(
  (event: SomeEvent) => {
    // handler logic
    onSomething?.(event);
  },
  [onSomething, /* other dependencies */]
);
```

**Guidelines:**
- Memoize event handlers passed to animated or pressable components
- Include all dependencies in the dependency array
- Don't over-memoize simple inline callbacks with no dependencies

---

## 1.5 Documentation

Add JSDoc comments for components with non-obvious behavior.

```tsx
/**
 * A card component for grouping related content.
 *
 * @ref Forwards a View ref.
 *
 * @remarks
 * - On web, renders as an article element for semantics
 * - Supports press interactions when onPress is provided
 */
```

**Guidelines:**
- Document platform differences
- Explain non-obvious prop behaviors
- Note accessibility considerations
- Keep it concise—code should be self-documenting where possible

---

## 1.6 Constants

Extract magic numbers into named constants at module scope.

```tsx
// Animation timing for card expansion
const EXPAND_DURATION_MS = 200;

// Default border radius matching design system
const CARD_BORDER_RADIUS = 8;
```

**Guidelines:**
- Use SCREAMING_SNAKE_CASE for constants
- Add brief comments explaining the "why"
- Keep constants near the top of the file
- Group related constants together

---

## Universal Checklist

- [ ] Works on iOS, Android, and Web
- [ ] Platform-specific styles use `Platform.select()`
- [ ] Variants use CVA (if component has variants)
- [ ] Ref forwarded
- [ ] TypeScript types exported
- [ ] `displayName` set
- [ ] Constants extracted and named

---

# Part 2: Interactive Component Standards

*Apply these to pressable elements: buttons, checkboxes, toggles, list items, cards with onPress, etc.*

---

## 2.1 Native Press Feedback

Interactive elements should provide tactile feedback on native platforms using scale animations.

```tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING_CONFIG = { damping: 15, stiffness: 400 };
const PRESS_SCALE = 0.97;

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePressIn = () => {
  if (Platform.OS !== 'web') {
    scale.value = withSpring(PRESS_SCALE, PRESS_SPRING_CONFIG);
  }
};

const handlePressOut = () => {
  if (Platform.OS !== 'web') {
    scale.value = withSpring(1, PRESS_SPRING_CONFIG);
  }
};

return (
  <AnimatedPressable
    style={Platform.OS !== 'web' ? animatedStyle : undefined}
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
  >
    {children}
  </AnimatedPressable>
);
```

**Guidelines:**
- Use spring animations, not timing (feels more natural)
- Scale down slightly (0.96-0.98), never scale up
- Only apply on native, not web (web uses CSS hover/active states)
- Skip animation for inline/text elements (like link buttons)

**Common mistake - reading shared values during render:**

```tsx
// WRONG - causes "Reading from value during component render" warning
<Animated.View style={{ transform: [{ scale: scale.value }] }} />

// WRONG - reading .value in render to pass as prop
<SomeComponent opacity={opacity.value} />

// CORRECT - read .value only inside useAnimatedStyle
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
<Animated.View style={animatedStyle} />
```

Always access `.value` inside `useAnimatedStyle`, `useDerivedValue`, or worklet functions—never during render.

**Web compatibility - skip reading shared values when not needed:**

On web, Reanimated evaluates `useAnimatedStyle` synchronously during render. If the animated style isn't used on web, guard the `.value` read:

```tsx
const isNative = Platform.OS !== 'web';

const animatedStyle = useAnimatedStyle(() => {
  // Skip reading shared value on web to avoid the warning
  if (!isNative) return {};
  return {
    transform: [{ scale: scale.value }],
  };
});

// Only apply on native
<AnimatedView style={isNative ? animatedStyle : undefined} />
```

> **Note for devs:** This press animation pattern (scale + spring + platform guard) repeats across interactive components (Button, Checkbox, Toggle, etc.). Consider extracting a shared `usePressAnimation` hook, potentially with platform-specific files (`.native.ts` / `.ts`) to keep Reanimated out of the web bundle entirely.

---

## 2.2 Haptic Feedback (iOS)

Provide haptic feedback on activation for interactive elements.

```tsx
import * as Haptics from 'expo-haptics';

const HAPTIC_THROTTLE_MS = 100;
const lastHapticTime = React.useRef(0);

const triggerHaptic = () => {
  if (Platform.OS === 'ios') {
    const now = Date.now();
    if (now - lastHapticTime.current >= HAPTIC_THROTTLE_MS) {
      lastHapticTime.current = now;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }
};

const handlePress = (event) => {
  triggerHaptic();
  onPress?.(event);
};
```

**Guidelines:**
- Fire on activation (`onPress`), not touch start (`onPressIn`)
- Throttle to prevent buzz spam on rapid taps
- Use `Light` impact for most interactions, `Medium` for significant actions
- Silently catch errors (haptics fail on simulator/unsupported devices)
- Make haptics configurable via prop, enabled by default

**Haptic intensity guide:**
| Action | Feedback Style |
|--------|----------------|
| Button tap, checkbox toggle | `Light` |
| Destructive action, important toggle | `Medium` |
| Error, invalid action | `NotificationFeedbackType.Error` |
| Success confirmation | `NotificationFeedbackType.Success` |

---

## 2.3 Scroll-Friendly Touch Handling

Prevent press feedback from interfering with scroll gestures.

```tsx
<Pressable
  delayPressIn={100}  // 100ms matches iOS scroll view behavior
  // ...
/>
```

**Guidelines:**
- Add `delayPressIn={100}` to pressable elements that appear inside scroll views
- This gives scroll gestures time to take over before press feedback triggers
- Skip for elements unlikely to be in scroll contexts (e.g., fixed header buttons)

---

## 2.4 Touch Targets

Ensure all interactive elements meet minimum touch target sizes (44x44pt recommended by Apple HIG).

```tsx
// For small visual elements, expand the touch target invisibly
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

<Pressable hitSlop={HIT_SLOP}>
  <SmallIcon />  {/* Visual size: 24x24 */}
</Pressable>
// Effective touch target: 40x40 (24 + 8 + 8)
```

**Guidelines:**
- Visual size can be smaller than touch target
- Use `hitSlop` to expand touch area without affecting layout
- Minimum 44x44pt effective touch target on mobile
- Calculate: visual size + (hitSlop * 2) >= 44

**Common hitSlop values:**
| Visual Size | hitSlop Needed |
|-------------|----------------|
| 16x16 | 14 all sides |
| 20x20 | 12 all sides |
| 24x24 | 10 all sides |
| 32x32 | 6 all sides |
| 40x40+ | Usually none |

---

## 2.5 Disabled State

Handle disabled state consistently across platforms.

```tsx
<Pressable
  disabled={disabled}
  className={cn(
    baseStyles,
    disabled && 'opacity-50',
    Platform.select({
      web: 'disabled:pointer-events-none disabled:cursor-not-allowed',
    })
  )}
  accessibilityState={{ disabled }}
>
```

**Guidelines:**
- Visual: Apply `opacity-50` to indicate disabled state
- Functional: The `disabled` prop prevents interactions
- Web: Add `pointer-events-none` and `cursor-not-allowed`
- Accessibility: Set `accessibilityState={{ disabled }}`
- Skip haptics and animations when disabled

---

## 2.6 Accessibility for Interactive Elements

Every interactive component must be accessible.

```tsx
<Pressable
  accessibilityRole="button"  // or 'link', 'checkbox', 'switch', etc.
  accessibilityState={{ disabled, checked }}  // reflect current state
  accessibilityLabel="Delete item"  // when content isn't self-describing
  // Web-specific (for proper HTML semantics)
  {...(Platform.OS === 'web' ? { role: 'button' } : null)}
>
```

**Required attributes:**
| Attribute | When to use |
|-----------|-------------|
| `accessibilityRole` | Always on interactive elements |
| `accessibilityState` | When element has states (disabled, checked, selected, expanded) |
| `accessibilityLabel` | When visual content doesn't describe the action |
| `accessibilityHint` | For non-obvious interactions |

**Common roles:**
- `button` - triggers an action
- `link` - navigates somewhere
- `checkbox` - toggles a boolean
- `switch` - toggles a setting
- `tab` - selects a panel
- `menuitem` - option in a menu

**Keyboard navigation (web):**
- Include focus-visible styles: `focus-visible:ring-[3px] focus-visible:ring-ring/50`
- Ensure logical tab order
- Support Enter/Space for activation

---

## Interactive Component Checklist

- [ ] Has press feedback animation (native only)
- [ ] Has haptic feedback (iOS, configurable)
- [ ] Touch target is at least 44x44pt
- [ ] Scroll-friendly (`delayPressIn` if inside ScrollView)
- [ ] Disabled state: visual (opacity), functional, accessible
- [ ] `accessibilityRole` set correctly
- [ ] `accessibilityState` reflects current state
- [ ] Focus-visible styles (web)
- [ ] Hover/active styles (web)

---

# Part 3: Form Component Standards

*Apply these to inputs, selects, textareas, and other form controls.*

---

## 3.1 Form State Styling

Form components need visual states for: default, focus, error, disabled.

```tsx
const inputStyles = cn(
  // Base
  'border border-input bg-background px-3 py-2 rounded-md',
  // Focus
  Platform.select({
    web: 'focus:border-ring focus:ring-[3px] focus:ring-ring/50 outline-none',
    native: focused && 'border-ring',
  }),
  // Error
  error && 'border-destructive',
  Platform.select({
    web: 'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  }),
  // Disabled
  disabled && 'opacity-50 bg-muted',
);
```

**States to handle:**
| State | Visual Treatment |
|-------|------------------|
| Default | Standard border, background |
| Focused | Ring/highlight, elevated border color |
| Error | Destructive border, optional icon |
| Disabled | Reduced opacity, muted background |
| Read-only | Subtle background difference |

---

## 3.2 Labels and Error Messages

Form controls should work with labels and display validation errors.

```tsx
type FormFieldProps = {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
};

// Associate label with input
<View>
  {label && (
    <Text nativeID="input-label" className="text-sm font-medium mb-1.5">
      {label}
      {required && <Text className="text-destructive"> *</Text>}
    </Text>
  )}

  <TextInput
    accessibilityLabelledBy="input-label"
    accessibilityDescribedBy={error ? 'input-error' : undefined}
    aria-invalid={!!error}
  />

  {error && (
    <Text nativeID="input-error" className="text-sm text-destructive mt-1.5">
      {error}
    </Text>
  )}
</View>
```

**Guidelines:**
- Use `nativeID` + `accessibilityLabelledBy` to associate labels
- Use `accessibilityDescribedBy` to associate error/description text
- Set `aria-invalid` when there's an error (web)
- Show required indicator visually and announce via `accessibilityLabel`

---

## 3.3 Controlled vs Uncontrolled

Support both controlled and uncontrolled usage patterns.

```tsx
type InputProps = {
  value?: string;           // Controlled
  defaultValue?: string;    // Uncontrolled
  onChangeText?: (text: string) => void;
};

const Input = ({ value, defaultValue, onChangeText, ...props }: InputProps) => {
  // Component works whether value is provided (controlled) or not (uncontrolled)
  return (
    <TextInput
      value={value}
      defaultValue={defaultValue}
      onChangeText={onChangeText}
      {...props}
    />
  );
};
```

**Guidelines:**
- Don't force controlled mode—let React Native handle uncontrolled state
- Document which mode the component supports
- Never mix `value` and `defaultValue`

---

## 3.4 Input Accessories (Icons, Buttons)

Support leading/trailing elements inside inputs.

```tsx
type InputProps = {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingPress?: () => void;
};

<View className="relative">
  {leadingIcon && (
    <View className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
      {leadingIcon}
    </View>
  )}

  <TextInput
    className={cn(
      'px-3',
      leadingIcon && 'pl-10',
      trailingIcon && 'pr-10',
    )}
  />

  {trailingIcon && (
    <Pressable
      className="absolute right-3 top-1/2 -translate-y-1/2"
      onPress={onTrailingPress}
      hitSlop={8}
    >
      {trailingIcon}
    </Pressable>
  )}
</View>
```

**Guidelines:**
- Leading icons are typically decorative (`pointer-events-none`)
- Trailing icons are often interactive (clear button, password toggle)
- Adjust padding to prevent text overlap with icons
- Interactive icons need proper touch targets

---

## 3.5 Keyboard Handling

Configure keyboard behavior appropriately for input type.

```tsx
<TextInput
  // Keyboard type
  keyboardType="email-address"  // or: number-pad, phone-pad, decimal-pad

  // Return key
  returnKeyType="next"  // or: done, go, search, send
  onSubmitEditing={() => nextInputRef.current?.focus()}

  // Auto-features
  autoCapitalize="none"  // for emails, usernames
  autoComplete="email"   // helps password managers
  autoCorrect={false}    // for codes, usernames

  // Security
  secureTextEntry={isPassword}
/>
```

**Common configurations:**
| Input Type | keyboardType | autoCapitalize | autoComplete |
|------------|--------------|----------------|--------------|
| Email | `email-address` | `none` | `email` |
| Password | `default` | `none` | `password` |
| Phone | `phone-pad` | `none` | `tel` |
| Number | `number-pad` | `none` | `off` |
| Search | `default` | `none` | `off` |
| Name | `default` | `words` | `name` |

---

## Form Component Checklist

- [ ] Visual states: default, focus, error, disabled
- [ ] Label association via `accessibilityLabelledBy`
- [ ] Error message association via `accessibilityDescribedBy`
- [ ] `aria-invalid` set when error present (web)
- [ ] Supports both controlled and uncontrolled usage
- [ ] Keyboard type matches input purpose
- [ ] Return key configured for form flow
- [ ] Leading/trailing icons don't overlap content
- [ ] Touch targets for any interactive icons

---

# Quick Reference

## Which standards apply?

| Component Type | Part 1 (Universal) | Part 2 (Interactive) | Part 3 (Form) |
|---------------|-------------------|---------------------|---------------|
| Button, IconButton | ✓ | ✓ | |
| Checkbox, Switch, Toggle | ✓ | ✓ | |
| Pressable Card, List Item | ✓ | ✓ | |
| Input, TextArea | ✓ | | ✓ |
| Select, Combobox | ✓ | ✓ | ✓ |
| Card, Container | ✓ | | |
| Badge, Avatar | ✓ | | |
| Divider, Skeleton | ✓ | | |

## Variant naming conventions

Use these names consistently across all components:

- `default` - Primary/standard appearance
- `secondary` - Less prominent alternative
- `destructive` - Dangerous/delete actions (red)
- `outline` - Bordered, transparent background
- `ghost` - No background until interaction
- `link` - Text-only, inline appearance

## Size naming conventions

- `sm` - Small/compact
- `default` - Standard size
- `lg` - Large/prominent
- `icon` - Square, icon-only (for buttons)
