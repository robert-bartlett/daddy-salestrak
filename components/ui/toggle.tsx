import { Icon } from '@/components/ui/icon';
import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as TogglePrimitive from '@rn-primitives/toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Platform, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedToggle = Animated.createAnimatedComponent(TogglePrimitive.Root);

// Spring config tuned for native toggle feel
const PRESS_SPRING_CONFIG = { damping: 15, stiffness: 400 };
const PRESS_SCALE = 0.97;

// Delay before press-in triggers, allows scroll gestures to take over
// 100ms matches iOS's built-in scroll view behavior
const PRESS_IN_DELAY = 100;

// Minimum time between haptic triggers to prevent buzz spam
const HAPTIC_THROTTLE_MS = 100;

// Expand touch target for smaller sizes to meet 44x44pt minimum
const HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

const toggleVariants = cva(
  cn(
    'group flex flex-row items-center justify-center gap-2 rounded-md',
    Platform.select({
      web: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex cursor-default whitespace-nowrap outline-none transition-[color,box-shadow] hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed active:bg-muted [&_svg]:pointer-events-none',
    })
  ),
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: cn(
          'border border-input bg-transparent shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-accent hover:text-accent-foreground active:bg-accent',
          })
        ),
      },
      size: {
        default: 'h-10 min-w-10 px-2.5 sm:h-9 sm:min-w-9 sm:px-2',
        sm: 'h-9 min-w-9 px-2 sm:h-8 sm:min-w-8 sm:px-1.5',
        lg: 'h-11 min-w-11 px-3 sm:h-10 sm:min-w-10 sm:px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const toggleTextVariants = cva(
  cn('text-sm text-foreground font-medium', Platform.select({ web: 'pointer-events-none transition-colors' })),
  {
    variants: {
      pressed: {
        true: 'text-accent-foreground',
        false: Platform.select({ web: 'group-hover:text-muted-foreground' }) ?? '',
      },
    },
    defaultVariants: {
      pressed: false,
    },
  }
);

type ToggleProps = TogglePrimitive.RootProps &
  VariantProps<typeof toggleVariants> & {
    /** Enable haptic feedback on iOS. Defaults to true. */
    haptics?: boolean;
  };

/**
 * A toggle button component that can be pressed or unpressed.
 *
 * @ref Forwards a View ref.
 *
 * @remarks
 * - Uses `accessibilityRole="switch"` to indicate toggleable state
 * - Native (iOS/Android): Press animation with scale feedback
 * - iOS: Optional haptic feedback on press activation
 * - Web: Hover and focus-visible styles
 */
const Toggle = React.forwardRef<View, ToggleProps>(
  (
    {
      className,
      variant,
      size,
      disabled,
      pressed,
      haptics,
      children,
      onPressIn,
      onPressOut,
      onPressedChange,
      ...props
    },
    ref
  ) => {
    const isNative = Platform.OS !== 'web';
    const scale = useSharedValue(1);
    const lastHapticTime = React.useRef(0);

    // Haptics enabled by default on iOS, can be overridden
    const hapticsEnabled = Platform.OS === 'ios' && (haptics ?? true);

    const animatedStyle = useAnimatedStyle(() => {
      // Skip reading shared value on web to avoid "Reading from value during render" warning
      // Web doesn't use this style anyway (see style prop below)
      if (!isNative) return {};
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = React.useCallback(
      (event: GestureResponderEvent) => {
        if (isNative && !disabled) {
          scale.value = withSpring(PRESS_SCALE, PRESS_SPRING_CONFIG);
        }
        onPressIn?.(event);
      },
      [disabled, isNative, onPressIn, scale]
    );

    const handlePressOut = React.useCallback(
      (event: GestureResponderEvent) => {
        if (isNative && !disabled) {
          scale.value = withSpring(1, PRESS_SPRING_CONFIG);
        }
        onPressOut?.(event);
      },
      [disabled, isNative, onPressOut, scale]
    );

    // Haptics fire on activation, not on touch start
    // Throttled to prevent buzz spam on rapid taps
    const handlePressedChange = React.useCallback(
      (newPressed: boolean) => {
        if (hapticsEnabled) {
          const now = Date.now();
          if (now - lastHapticTime.current >= HAPTIC_THROTTLE_MS) {
            lastHapticTime.current = now;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
              // Silently ignore haptic failures (e.g., simulator, unsupported device)
            });
          }
        }
        onPressedChange?.(newPressed);
      },
      [hapticsEnabled, onPressedChange]
    );

    const textStyles = toggleTextVariants({ pressed: pressed ?? false });

    // Web uses regular primitive (Reanimated not fully compatible), native uses AnimatedToggle
    const ToggleComponent = isNative ? AnimatedToggle : TogglePrimitive.Root;

    return (
      <TextClassContext.Provider value={textStyles}>
        <ToggleComponent
          ref={ref}
          pressed={pressed}
          disabled={disabled}
          onPressedChange={handlePressedChange}
          accessibilityRole="switch"
          accessibilityState={{ checked: pressed, disabled }}
          {...(Platform.OS === 'web' ? { role: 'switch', 'aria-checked': pressed } : null)}
          style={isNative ? animatedStyle : undefined}
          className={cn(
            toggleVariants({ variant, size }),
            disabled && 'opacity-50',
            pressed && 'bg-accent',
            className
          )}
          hitSlop={isNative ? HIT_SLOP : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...(isNative ? { delayPressIn: PRESS_IN_DELAY } : null)}
          {...props}
        >
          {typeof children === 'function' ? children : wrapTextChildren(children)}
        </ToggleComponent>
      </TextClassContext.Provider>
    );
  }
);

Toggle.displayName = 'Toggle';

function ToggleIcon({ className, ...props }: React.ComponentProps<typeof Icon>) {
  const textClass = React.useContext(TextClassContext);
  return <Icon className={cn('size-4 shrink-0', textClass, className)} {...props} />;
}

export { Toggle, ToggleIcon, toggleTextVariants, toggleVariants };
export type { ToggleProps };
