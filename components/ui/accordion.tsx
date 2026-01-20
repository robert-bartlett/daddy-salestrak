import { Icon } from '@/components/ui/icon';
import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as AccordionPrimitive from '@rn-primitives/accordion';
import * as Haptics from 'expo-haptics';
import { ChevronDown } from 'lucide-react-native';
import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  FadeOutUp,
  LayoutAnimationConfig,
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

// Minimum time between haptic triggers to prevent buzz spam
const HAPTIC_THROTTLE_MS = 100;

// Expand touch target for better tappability (visual height is ~56pt, this ensures 44pt minimum)
const TRIGGER_HIT_SLOP = { top: 0, bottom: 0, left: 8, right: 8 };

type AccordionProps = Omit<AccordionPrimitive.RootProps, 'asChild'>;

const Accordion = React.forwardRef<View, AccordionProps>(
  function Accordion({ children, ...props }, ref) {
    return (
      <LayoutAnimationConfig skipEntering>
        <AccordionPrimitive.Root
          ref={ref}
          {...(props as AccordionPrimitive.RootProps)}
          asChild={Platform.OS !== 'web'}>
          <Animated.View layout={LinearTransition.duration(200)}>{children}</Animated.View>
        </AccordionPrimitive.Root>
      </LayoutAnimationConfig>
    );
  }
);

Accordion.displayName = 'Accordion';

type AccordionItemProps = Omit<AccordionPrimitive.ItemProps, 'asChild'>;

const AccordionItem = React.forwardRef<View, AccordionItemProps>(
  function AccordionItem({ children, className, value, ...props }, ref) {
    return (
      <AccordionPrimitive.Item
        ref={ref}
        className={cn(
          'border-b border-border',
          Platform.select({ web: 'last:border-b-0' }),
          className
        )}
        value={value}
        asChild={Platform.OS !== 'web'}
        {...props}>
        <Animated.View
          className="native:overflow-hidden"
          layout={Platform.select({ native: LinearTransition.duration(200) })}>
          {children}
        </Animated.View>
      </AccordionPrimitive.Item>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

type AccordionTriggerProps = Omit<AccordionPrimitive.TriggerProps, 'asChild'> & {
  children?: React.ReactNode;
  /** Enable haptic feedback on iOS. Defaults to true. */
  haptics?: boolean;
};

/**
 * Accordion trigger button that expands/collapses content.
 *
 * @remarks
 * - iOS: Haptic feedback on activation (configurable via `haptics` prop)
 * - Web: CSS hover/focus states
 */
const AccordionTrigger = React.forwardRef<View, AccordionTriggerProps>(
  function AccordionTrigger({ className, children, disabled, haptics = true, onPress, ...props }, ref) {
    const { isExpanded } = AccordionPrimitive.useItemContext();
    const isNative = Platform.OS !== 'web';
    const lastHapticTime = React.useRef(0);

    // Haptics enabled by default on iOS
    const hapticsEnabled = Platform.OS === 'ios' && haptics;

    // Chevron rotation animation
    const progress = useDerivedValue(
      () => (isExpanded ? withTiming(1, { duration: 250 }) : withTiming(0, { duration: 200 })),
      [isExpanded]
    );
    const chevronStyle = useAnimatedStyle(
      () => ({
        transform: [{ rotate: `${progress.value * 180}deg` }],
      }),
      [progress]
    );

    // Haptics fire on activation (onPress), not on touch start
    // Throttled to prevent buzz spam on rapid taps
    const handlePress = React.useCallback(
      (event: GestureResponderEvent) => {
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
      [hapticsEnabled, disabled, onPress]
    );

    return (
      <TextClassContext.Provider value="text-left text-sm font-medium">
        <AccordionPrimitive.Header>
          <AccordionPrimitive.Trigger ref={ref} {...props} disabled={disabled} asChild>
            <Pressable
              className={cn(
                'flex-row items-start justify-between gap-4 rounded-md py-4',
                disabled && 'opacity-50',
                Platform.select({
                  web: 'flex flex-1 outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed [&[data-state=open]>svg]:rotate-180',
                }),
                className
              )}
              accessibilityRole="button"
              accessibilityState={{ disabled: !!disabled, expanded: isExpanded }}
              {...(Platform.OS === 'web' ? { role: 'button', 'aria-expanded': isExpanded } : null)}
              hitSlop={isNative ? TRIGGER_HIT_SLOP : undefined}
              onPress={handlePress}>
              {wrapTextChildren(children)}
              <Animated.View style={chevronStyle}>
                <Icon
                  as={ChevronDown}
                  size={16}
                  className={cn(
                    'shrink-0 translate-y-0.5 text-muted-foreground',
                    Platform.select({
                      web: 'pointer-events-none transition-transform duration-200',
                    })
                  )}
                />
              </Animated.View>
            </Pressable>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
      </TextClassContext.Provider>
    );
  }
);

AccordionTrigger.displayName = 'AccordionTrigger';

type AccordionContentProps = Omit<AccordionPrimitive.ContentProps, 'asChild'>;

const AccordionContent = React.forwardRef<View, AccordionContentProps>(
  function AccordionContent({ className, children, ...props }, ref) {
    const { isExpanded } = AccordionPrimitive.useItemContext();
    return (
      <TextClassContext.Provider value="text-sm">
        <AccordionPrimitive.Content
          ref={ref}
          className={cn(
            'overflow-hidden',
            Platform.select({
              web: isExpanded ? 'animate-accordion-down' : 'animate-accordion-up',
            })
          )}
          {...props}>
          {/* Outer View ensures pb-4 is included in content height measurement on web */}
          <View className="pb-4">
            <Animated.View
              exiting={Platform.select({ native: FadeOutUp.duration(200) })}
              className={className}>
              {children}
            </Animated.View>
          </View>
        </AccordionPrimitive.Content>
      </TextClassContext.Provider>
    );
  }
);

AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
export type { AccordionContentProps, AccordionItemProps, AccordionProps, AccordionTriggerProps };
