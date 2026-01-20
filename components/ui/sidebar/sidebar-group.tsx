import { Icon } from '@/components/ui/icon';
import { Text, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSidebarInternal } from './sidebar-internal-context';

// Context for sharing collapsible state between SidebarGroup and its children
type SidebarGroupContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  collapsible: boolean;
};

const SidebarGroupContext = React.createContext<SidebarGroupContextValue | null>(null);

/**
 * Hook to access the parent SidebarGroup's collapsible state.
 *
 * @returns Context value with isOpen, setIsOpen, and collapsible, or null if not within a SidebarGroup
 */
function useSidebarGroup() {
  return React.useContext(SidebarGroupContext);
}

type SidebarGroupProps = React.ComponentProps<typeof View> & {
  /** Enable collapsible behavior - clicking the label toggles content visibility */
  collapsible?: boolean;
  /** Initial open state when collapsible (default: true) */
  defaultOpen?: boolean;
};

/**
 * Groups related sidebar menu items together.
 *
 * @remarks
 * - Use with SidebarGroupLabel and SidebarGroupContent
 * - Multiple groups can be used within SidebarContent
 * - When collapsible is true, clicking the label toggles content visibility
 */
const SidebarGroup = React.forwardRef<View, SidebarGroupProps>(
  ({ className, collapsible = false, defaultOpen = true, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    const contextValue = React.useMemo(
      () => ({ isOpen, setIsOpen, collapsible }),
      [isOpen, setIsOpen, collapsible]
    );

    return (
      <SidebarGroupContext.Provider value={contextValue}>
        <View
          ref={ref}
          className={cn('group relative flex w-full flex-col gap-1', className)}
          {...props}>
          {children}
        </View>
      </SidebarGroupContext.Provider>
    );
  }
);

SidebarGroup.displayName = 'SidebarGroup';

type SidebarGroupLabelProps = React.ComponentProps<typeof View> & {
  children?: React.ReactNode;
};

/**
 * Label/heading for a sidebar group.
 *
 * @remarks
 * - Displays as small uppercase text
 * - Hidden when sidebar is in collapsed icon mode
 * - When parent group is collapsible, renders as a clickable button with chevron
 */
const SidebarGroupLabel = React.forwardRef<View, SidebarGroupLabelProps>(
  ({ className, children, ...props }, ref) => {
    const internal = useSidebarInternal();
    const groupContext = useSidebarGroup();

    // Chevron rotation animation: 0° (right/closed) → 90° (down/open)
    const isOpen = groupContext?.isOpen ?? true;
    const progress = useDerivedValue(
      () => (isOpen ? withTiming(1, { duration: 250 }) : withTiming(0, { duration: 200 })),
      [isOpen]
    );
    const chevronStyle = useAnimatedStyle(
      () => ({
        transform: [{ rotate: `${progress.value * 90}deg` }],
      }),
      [progress]
    );

    // Hide when sidebar is collapsed to icon mode
    if (internal?.isCollapsed) {
      return null;
    }

    const labelContent = (
      <Text className="text-xs font-medium text-sidebar-foreground/70">
        {typeof children === 'string' ? children : wrapTextChildren(children)}
      </Text>
    );

    // Non-collapsible: render as static View
    if (!groupContext?.collapsible) {
      return (
        <View
          ref={ref}
          className={cn(
            'flex h-8 shrink-0 flex-row items-center rounded-md px-2',
            className
          )}
          {...props}>
          {labelContent}
        </View>
      );
    }

    // Collapsible: render as Pressable with chevron
    return (
      <Pressable
        ref={ref}
        onPress={() => groupContext.setIsOpen(!groupContext.isOpen)}
        accessibilityRole="button"
        accessibilityState={{ expanded: groupContext.isOpen }}
        className={cn(
          'flex h-8 shrink-0 flex-row items-center justify-between rounded-md px-2',
          Platform.select({ web: 'cursor-pointer hover:bg-sidebar-accent/50' }),
          className
        )}
        {...props}>
        {labelContent}
        <Animated.View style={chevronStyle}>
          <Icon as={ChevronRight} size={14} className="text-sidebar-foreground/50" />
        </Animated.View>
      </Pressable>
    );
  }
);

SidebarGroupLabel.displayName = 'SidebarGroupLabel';

type SidebarGroupContentProps = React.ComponentProps<typeof View>;

/**
 * Container for menu items within a group.
 *
 * @remarks
 * - When parent group is collapsible and closed, content is hidden
 */
const SidebarGroupContent = React.forwardRef<View, SidebarGroupContentProps>(
  ({ className, children, ...props }, ref) => {
    const groupContext = useSidebarGroup();

    // Hide content when collapsible group is closed
    if (groupContext?.collapsible && !groupContext.isOpen) {
      return null;
    }

    return (
      <View
        ref={ref}
        className={cn('w-full', className)}
        {...props}>
        {children}
      </View>
    );
  }
);

SidebarGroupContent.displayName = 'SidebarGroupContent';

type SidebarGroupActionProps = React.ComponentProps<typeof Pressable> & {
  showOnHover?: boolean;
};

/**
 * Action button that appears in the group header area.
 *
 * @remarks
 * - Positioned absolutely to the right of the group label
 * - Use for actions like "add new" or "expand all"
 */
const SidebarGroupAction = React.forwardRef<View, SidebarGroupActionProps>(
  ({ className, showOnHover, ...props }, ref) => {
    const internal = useSidebarInternal();

    if (internal?.isCollapsed) {
      return null;
    }

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        className={cn(
          'absolute end-2 top-2 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-70 active:opacity-100',
          Platform.select({
            web: cn(
              'hover:opacity-100 focus-visible:opacity-100',
              // showOnHover: hide by default, reveal on parent hover/focus (web only)
              showOnHover && 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            ),
          }),
          // On native, showOnHover is ignored - actions are always visible since there's no hover
          className
        )}
        {...props}
      />
    );
  }
);

SidebarGroupAction.displayName = 'SidebarGroupAction';

export {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupContext,
  SidebarGroupLabel,
  useSidebarGroup,
};

export type {
  SidebarGroupActionProps,
  SidebarGroupContentProps,
  SidebarGroupContextValue,
  SidebarGroupLabelProps,
  SidebarGroupProps,
};
