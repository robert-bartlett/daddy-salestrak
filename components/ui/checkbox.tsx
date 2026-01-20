import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Expand touch target to meet 44pt minimum (16px visual + 14*2 = 44pt)
const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

// Spring config tuned for snappy checkbox feel
const PRESS_SPRING_CONFIG = { damping: 15, stiffness: 400 };
const PRESS_SCALE = 0.9;

// Minimum time between haptic triggers to prevent buzz spam
const HAPTIC_THROTTLE_MS = 100;

type CheckboxProps = CheckboxPrimitive.RootProps & {
  /** Class name applied when checkbox is checked */
  checkedClassName?: string;
  /** Class name for the indicator container */
  indicatorClassName?: string;
  /** Class name for the check icon */
  iconClassName?: string;
  /** Enable haptic feedback on iOS. Defaults to true. */
  haptics?: boolean;
};

/**
 * A checkbox component with press animation and haptic feedback.
 *
 * @ref Forwards a View ref.
 *
 * @remarks
 * - Native (iOS/Android): Press animation with scale feedback
 * - iOS: Optional haptic feedback on toggle
 * - Meets 44pt minimum touch target via hitSlop
 */
const Checkbox = React.forwardRef<View, CheckboxProps>(
  (
    {
      className,
      checkedClassName,
      indicatorClassName,
      iconClassName,
      checked,
      disabled,
      haptics = true,
      onCheckedChange,
      onPressIn,
      onPressOut,
      ...props
    },
    ref
  ) => {
    const isNative = Platform.OS !== 'web';
    const scale = useSharedValue(1);
    const lastHapticTime = React.useRef(0);

    // Haptics enabled by default on iOS, can be overridden
    const hapticsEnabled = Platform.OS === 'ios' && haptics;

    const animatedStyle = useAnimatedStyle(() => {
      // Skip reading shared value on web to avoid "Reading from value during render" warning
      if (!isNative) return {};
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = React.useCallback(
      (event: unknown) => {
        if (isNative && !disabled) {
          scale.value = withSpring(PRESS_SCALE, PRESS_SPRING_CONFIG);
        }
        onPressIn?.(event as Parameters<NonNullable<typeof onPressIn>>[0]);
      },
      [disabled, isNative, onPressIn, scale]
    );

    const handlePressOut = React.useCallback(
      (event: unknown) => {
        if (isNative && !disabled) {
          scale.value = withSpring(1, PRESS_SPRING_CONFIG);
        }
        onPressOut?.(event as Parameters<NonNullable<typeof onPressOut>>[0]);
      },
      [disabled, isNative, onPressOut, scale]
    );

    // Fire haptic and call onCheckedChange when checkbox is toggled
    const handleCheckedChange = React.useCallback(
      (newChecked: boolean) => {
        if (hapticsEnabled) {
          const now = Date.now();
          if (now - lastHapticTime.current >= HAPTIC_THROTTLE_MS) {
            lastHapticTime.current = now;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
              // Silently ignore haptic failures (e.g., simulator, unsupported device)
            });
          }
        }
        onCheckedChange?.(newChecked);
      },
      [hapticsEnabled, onCheckedChange]
    );

    const resolvedChecked = typeof checked === 'boolean' ? checked : undefined;

    const rootElement = (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="checkbox"
        accessibilityState={{ disabled, checked: !!checked }}
        {...(Platform.OS === 'web' ? { role: 'checkbox', 'aria-checked': resolvedChecked } : null)}
        hitSlop={HIT_SLOP}
        className={cn(
          'size-4 shrink-0 rounded-[4px] border border-input shadow-sm shadow-black/5 dark:bg-input/30',
          Platform.select({
            web: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer cursor-default outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed',
            native: 'overflow-hidden',
          }),
          checked && cn('border-primary', checkedClassName),
          disabled && 'opacity-50',
          className
        )}
        {...props}>
        <CheckboxPrimitive.Indicator
          className={cn(
            'h-full w-full items-center justify-center bg-primary',
            indicatorClassName
          )}>
          <Icon
            as={Check}
            size={12}
            strokeWidth={Platform.OS === 'web' ? 2.5 : 3.5}
            className={cn('text-primary-foreground', iconClassName)}
          />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    // Wrap in Animated.View on native for scale animation
    if (isNative) {
      return <Animated.View style={animatedStyle}>{rootElement}</Animated.View>;
    }

    return rootElement;
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
