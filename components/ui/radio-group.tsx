import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as RadioGroupPrimitive from '@rn-primitives/radio-group';

// Spring config tuned for native button feel
const PRESS_SPRING_CONFIG = { damping: 15, stiffness: 400 };
const PRESS_SCALE = 0.97;

// Minimum time between haptic triggers to prevent buzz spam
const HAPTIC_THROTTLE_MS = 100;

// Size-4 (16px) visual, need hitSlop of 14 to reach 44pt touch target
const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

type RadioGroupProps = RadioGroupPrimitive.RootProps &
  React.RefAttributes<RadioGroupPrimitive.RootRef>;

/**
 * A radio group container for managing mutually exclusive selection.
 *
 * @ref Forwards ref to the underlying View.
 */
const RadioGroup = React.forwardRef<RadioGroupPrimitive.RootRef, RadioGroupProps>(
  ({ className, ...props }, ref) => {
    return <RadioGroupPrimitive.Root ref={ref} className={cn('gap-3', className)} {...props} />;
  }
);

RadioGroup.displayName = 'RadioGroup';

type RadioGroupItemProps = RadioGroupPrimitive.ItemProps &
  React.RefAttributes<RadioGroupPrimitive.ItemRef> & {
    /** Enable haptic feedback on iOS. Defaults to true. */
    haptics?: boolean;
    /** Whether this radio item is currently selected. Used for accessibility state. */
    checked?: boolean;
  };

/**
 * A radio button item within a RadioGroup.
 *
 * @ref Forwards ref to the underlying Pressable.
 *
 * @remarks
 * - Native (iOS/Android): Press animation with scale feedback
 * - iOS: Optional haptic feedback on selection
 * - Platform-appropriate accessibility attributes
 */
const RadioGroupItem = React.forwardRef<RadioGroupPrimitive.ItemRef, RadioGroupItemProps>(
  (
    { className, disabled, haptics = true, checked, onPressIn, onPressOut, onPress, ...props },
    ref
  ) => {
    const isNative = Platform.OS !== 'web';
    const scale = useSharedValue(1);
    const lastHapticTime = React.useRef(0);
    const hapticsEnabled = Platform.OS === 'ios' && haptics;
    const resolvedChecked =
      typeof checked === 'boolean'
        ? checked
        : typeof props['aria-checked'] === 'boolean'
          ? props['aria-checked']
          : undefined;

    const animatedStyle = useAnimatedStyle(() => {
      // Skip reading shared value on web to avoid "Reading from value during render" warning
      if (!isNative) return {};
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = React.useCallback(
      (event: Parameters<NonNullable<RadioGroupPrimitive.ItemProps['onPressIn']>>[0]) => {
        if (isNative && !disabled) {
          scale.value = withSpring(PRESS_SCALE, PRESS_SPRING_CONFIG);
        }
        onPressIn?.(event);
      },
      [disabled, isNative, onPressIn, scale]
    );

    const handlePressOut = React.useCallback(
      (event: Parameters<NonNullable<RadioGroupPrimitive.ItemProps['onPressOut']>>[0]) => {
        if (isNative && !disabled) {
          scale.value = withSpring(1, PRESS_SPRING_CONFIG);
        }
        onPressOut?.(event);
      },
      [disabled, isNative, onPressOut, scale]
    );

    const handlePress = React.useCallback(
      (event: Parameters<NonNullable<RadioGroupPrimitive.ItemProps['onPress']>>[0]) => {
        if (hapticsEnabled && !disabled) {
          const now = Date.now();
          if (now - lastHapticTime.current >= HAPTIC_THROTTLE_MS) {
            lastHapticTime.current = now;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
              // Silently ignore haptic failures (e.g., simulator, unsupported device)
            });
          }
        }
        onPress?.(event);
      },
      [disabled, hapticsEnabled, onPress]
    );

    const itemContent = (
      <RadioGroupPrimitive.Item
        ref={ref}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ disabled: !!disabled, selected: resolvedChecked }}
        {...(Platform.OS === 'web' ? { 'aria-checked': resolvedChecked } : null)}
        hitSlop={HIT_SLOP}
        className={cn(
          'aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input shadow-sm shadow-black/5 dark:bg-input/30',
          Platform.select({
            web: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-none transition-all hover:border-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed',
          }),
          disabled && 'opacity-50',
          className
        )}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...props}>
        <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Item>
    );

    // Wrap in Animated.View on native for scale animation
    if (isNative) {
      return <Animated.View style={animatedStyle}>{itemContent}</Animated.View>;
    }

    return itemContent;
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
export type { RadioGroupProps, RadioGroupItemProps };
