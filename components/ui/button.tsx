import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Platform, Pressable, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    Platform.select({
      web: "whitespace-nowrap outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        // Native: scale animation provides feedback, no active: styles needed
        // Web: active: styles provide feedback (no scale animation)
        default: cn(
          'bg-primary shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-primary/90 active:bg-primary/90' })
        ),
        destructive: cn(
          'bg-destructive shadow-sm shadow-black/5 dark:bg-destructive/60',
          Platform.select({
            web: 'hover:bg-destructive/90 active:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          })
        ),
        outline: cn(
          'border border-border bg-background shadow-sm shadow-black/5 dark:border-input dark:bg-input/30',
          Platform.select({
            web: 'hover:bg-accent active:bg-accent dark:hover:bg-input/50 dark:active:bg-input/50',
          })
        ),
        secondary: cn(
          'bg-secondary shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-secondary/80 active:bg-secondary/80' })
        ),
        ghost: cn(
          '',
          Platform.select({ web: 'hover:bg-accent active:bg-accent dark:hover:bg-accent/50 dark:active:bg-accent/50' })
        ),
        // Link variant uses separate linkStyles to avoid button layout
        link: '',
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-md px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-md px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Separate styles for link variant - renders inline without button dimensions.
 * Intentionally excludes flex-row, height, padding, and rounded corners.
 */
const linkStyles = cn(
  'group',
  Platform.select({
    web: 'inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
  })
);

const buttonTextVariants = cva(
  cn(
    'text-sm font-medium',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-destructive-foreground',
        outline: cn(
          'text-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground group-active:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: cn(
          'text-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground group-active:text-accent-foreground' })
        ),
        link: cn(
          'text-primary',
          Platform.select({ web: 'underline-offset-4 group-hover:underline group-active:underline' })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    /** Enable haptic feedback on iOS. Defaults to true for non-link variants. */
    haptics?: boolean;
  };

// Spring config tuned for native button feel
const PRESS_SPRING_CONFIG = { damping: 15, stiffness: 400 };
const PRESS_SCALE = 0.97;

// Delay before press-in triggers, allows scroll gestures to take over
// 100ms matches iOS's built-in scroll view behavior
const PRESS_IN_DELAY = 100;

// Minimum time between haptic triggers to prevent buzz spam
const HAPTIC_THROTTLE_MS = 100;

// Link variant has smaller visual footprint, so expand touch target
const LINK_HIT_SLOP = { top: 8, bottom: 8, left: 4, right: 4 };

/**
 * A button component with multiple variants and sizes.
 *
 * @ref Forwards a View ref. On native this is a RN View instance with `.measure()`,
 * `.focus()`, etc. On web this is the underlying DOM node (supports standard DOM
 * methods). The ref is stable across platforms for common operations.
 *
 * @remarks
 * - Link variant renders inline without button dimensions
 * - Platform-appropriate accessibility attributes
 * - Native (iOS/Android): Press animation with scale feedback
 * - iOS: Optional haptic feedback on press activation
 * - Link variant uses `accessibilityRole="link"` but is not a true anchor element;
 *   for full link behavior on web (right-click menu, cmd+click), use an `<a>` tag
 */
const Button = React.forwardRef<View, ButtonProps>(
  ({ className, variant, size, disabled, haptics, children, onPressIn, onPressOut, onPress, ...props }, ref) => {
    const isLink = variant === 'link';
    const isNative = Platform.OS !== 'web';
    const textStyles = buttonTextVariants({ variant, size });
    const scale = useSharedValue(1);
    const lastHapticTime = React.useRef(0);

    // Haptics enabled by default for non-link buttons on iOS, can be overridden
    const hapticsEnabled = Platform.OS === 'ios' && (haptics ?? !isLink);

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
        if (isNative && !disabled && !isLink) {
          scale.value = withSpring(PRESS_SCALE, PRESS_SPRING_CONFIG);
        }
        onPressIn?.(event);
      },
      [disabled, isLink, isNative, onPressIn, scale]
    );

    const handlePressOut = React.useCallback(
      (event: GestureResponderEvent) => {
        if (isNative && !disabled && !isLink) {
          scale.value = withSpring(1, PRESS_SPRING_CONFIG);
        }
        onPressOut?.(event);
      },
      [disabled, isLink, isNative, onPressOut, scale]
    );

    // Haptics fire on activation (onPress), not on touch start
    // Throttled to prevent buzz spam on rapid taps
    const handlePress = React.useCallback(
      (event: GestureResponderEvent) => {
        if (hapticsEnabled) {
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
      [hapticsEnabled, onPress]
    );

    const resolvedClassName = cn(
      isLink ? linkStyles : buttonVariants({ variant, size }),
      disabled && 'opacity-50',
      className
    );

    // Web uses regular Pressable (Reanimated not fully compatible), native uses AnimatedPressable
    const PressableComponent = isNative ? AnimatedPressable : Pressable;

    return (
      <TextClassContext.Provider value={textStyles}>
        <PressableComponent
          ref={ref}
          disabled={disabled}
          accessibilityRole={isLink ? 'link' : 'button'}
          {...(Platform.OS === 'web' ? { role: isLink ? 'link' : 'button' } : null)}
          style={isNative ? animatedStyle : undefined}
          className={resolvedClassName}
          hitSlop={isLink && isNative ? LINK_HIT_SLOP : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          {...(isNative && !isLink ? { delayPressIn: PRESS_IN_DELAY } : null)}
          {...props}
        >
          {typeof children === 'function' ? children : wrapTextChildren(children)}
        </PressableComponent>
      </TextClassContext.Provider>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
