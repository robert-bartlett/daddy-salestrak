import { Text, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSidebar } from './sidebar-context';
import { useSidebarInternal } from './sidebar';

type SidebarGroupProps = React.ComponentProps<typeof View>;

/**
 * Groups related sidebar menu items together.
 *
 * @remarks
 * - Use with SidebarGroupLabel and SidebarGroupContent
 * - Multiple groups can be used within SidebarContent
 */
const SidebarGroup = React.forwardRef<View, SidebarGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('relative flex w-full flex-col gap-1', className)}
        {...props}
      />
    );
  }
);

SidebarGroup.displayName = 'SidebarGroup';

type SidebarGroupLabelProps = React.ComponentProps<typeof View> & {
  asChild?: boolean;
  children?: React.ReactNode;
};

/**
 * Label/heading for a sidebar group.
 *
 * @remarks
 * - Displays as small uppercase text
 * - Hidden when sidebar is in collapsed icon mode
 */
const SidebarGroupLabel = React.forwardRef<View, SidebarGroupLabelProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const { state } = useSidebar();
    const internal = useSidebarInternal();
    const isCollapsed = state === 'collapsed' && internal?.collapsible === 'icon';

    if (isCollapsed) {
      return null;
    }

    return (
      <View
        ref={ref}
        className={cn(
          'flex h-8 shrink-0 flex-row items-center rounded-md px-2',
          className
        )}
        {...props}>
        <Text className="text-xs font-medium text-sidebar-foreground/70">
          {typeof children === 'string' ? children : wrapTextChildren(children)}
        </Text>
      </View>
    );
  }
);

SidebarGroupLabel.displayName = 'SidebarGroupLabel';

type SidebarGroupContentProps = React.ComponentProps<typeof View>;

/**
 * Container for menu items within a group.
 */
const SidebarGroupContent = React.forwardRef<View, SidebarGroupContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      />
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
    const { state } = useSidebar();
    const internal = useSidebarInternal();
    const isCollapsed = state === 'collapsed' && internal?.collapsible === 'icon';

    if (isCollapsed) {
      return null;
    }

    return (
      <Pressable
        ref={ref}
        className={cn(
          'absolute right-2 top-2 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-70 active:opacity-100',
          showOnHover && 'opacity-0',
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
  SidebarGroupLabel,
};

export type {
  SidebarGroupActionProps,
  SidebarGroupContentProps,
  SidebarGroupLabelProps,
  SidebarGroupProps,
};
