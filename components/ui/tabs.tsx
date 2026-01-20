import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@rn-primitives/tabs';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Platform, type GestureResponderEvent } from 'react-native';

// Minimum time between haptic triggers to prevent buzz spam
const HAPTIC_THROTTLE_MS = 100;

// Delay before press-in triggers, allows scroll gestures to take over
const PRESS_IN_DELAY = 100;

// Expand touch target for tabs (visual height ~33px, this adds to reach 44pt minimum)
const TRIGGER_HIT_SLOP = { top: 6, bottom: 6, left: 4, right: 4 };

type TabsProps = TabsPrimitive.RootProps & React.RefAttributes<TabsPrimitive.RootRef>;

const Tabs = React.forwardRef<TabsPrimitive.RootRef, TabsProps>(
  ({ className, ...props }, ref) => {
    return (
      <TabsPrimitive.Root
        ref={ref}
        className={cn('flex flex-col gap-2', className)}
        {...props}
      />
    );
  }
);

Tabs.displayName = 'Tabs';

type TabsListProps = TabsPrimitive.ListProps & React.RefAttributes<TabsPrimitive.ListRef>;

const TabsList = React.forwardRef<TabsPrimitive.ListRef, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          'flex h-9 flex-row items-center justify-center rounded-lg bg-muted p-[3px]',
          Platform.select({ web: 'inline-flex w-fit', native: 'mr-auto' }),
          className
        )}
        {...props}
      />
    );
  }
);

TabsList.displayName = 'TabsList';

type TabsTriggerProps = TabsPrimitive.TriggerProps &
  React.RefAttributes<TabsPrimitive.TriggerRef> & {
    /** Enable haptic feedback on iOS. Defaults to true. */
    haptics?: boolean;
  };

/**
 * A tab trigger button that selects a tab panel.
 *
 * @ref Forwards to the underlying Pressable element.
 *
 * @remarks
 * - iOS: Haptic feedback on activation (configurable via `haptics` prop)
 * - Touch target expanded to meet 44pt minimum
 * - Scroll-friendly with delayed press-in
 */
const TabsTrigger = React.forwardRef<TabsPrimitive.TriggerRef, TabsTriggerProps>(
  ({ className, disabled, haptics = true, onPress, children, ...props }, ref) => {
    const { value } = TabsPrimitive.useRootContext();
    const lastHapticTime = React.useRef(0);
    const isSelected = props.value === value;

    // Haptics fire on activation, throttled to prevent buzz spam
    const handlePress = React.useCallback(
      (event: GestureResponderEvent) => {
        if (disabled) return;

        if (Platform.OS === 'ios' && haptics) {
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
      [disabled, haptics, onPress]
    );

    return (
      <TextClassContext.Provider
        value={cn(
          'text-foreground dark:text-muted-foreground text-sm font-medium',
          isSelected && 'dark:text-foreground'
        )}
      >
        <TabsPrimitive.Trigger
          ref={ref}
          disabled={disabled}
          // Height calc prevents 1px overflow from parent's 3px padding + border rendering
          className={cn(
            'flex h-[calc(100%-1px)] flex-row items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 shadow-none',
            Platform.select({
              web: 'inline-flex cursor-default whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0',
            }),
            disabled && 'opacity-50',
            isSelected && 'bg-background dark:border-foreground/10 dark:bg-input/30',
            className
          )}
          accessibilityRole="tab"
          accessibilityState={{ disabled: !!disabled, selected: isSelected }}
          {...(Platform.OS === 'web'
            ? { role: 'tab', 'aria-selected': isSelected }
            : { hitSlop: TRIGGER_HIT_SLOP, delayPressIn: PRESS_IN_DELAY })}
          onPress={handlePress}
          {...props}
        >
          {typeof children === 'function' ? children : wrapTextChildren(children)}
        </TabsPrimitive.Trigger>
      </TextClassContext.Provider>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

type TabsContentProps = TabsPrimitive.ContentProps & React.RefAttributes<TabsPrimitive.ContentRef>;

const TabsContent = React.forwardRef<TabsPrimitive.ContentRef, TabsContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(Platform.select({ web: 'flex-1 outline-none' }), className)}
        {...props}
      />
    );
  }
);

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsContent, TabsList, TabsTrigger };
export type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps };
