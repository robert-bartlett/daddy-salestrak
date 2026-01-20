import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSidebar } from './sidebar-context';
import { useSidebarInternal } from './sidebar';

type SidebarMenuSubProps = React.ComponentProps<typeof View>;

/**
 * Container for nested submenu items.
 *
 * @remarks
 * - Renders with left padding and border for visual hierarchy
 * - Hidden when sidebar is in collapsed icon mode
 */
const SidebarMenuSub = React.forwardRef<View, SidebarMenuSubProps>(
  ({ className, ...props }, ref) => {
    const { state, isMobile } = useSidebar();
    const internal = useSidebarInternal();
    // On mobile, sidebar always shows expanded in the sheet
    const isCollapsed = !isMobile && state === 'collapsed' && internal?.collapsible === 'icon';

    if (isCollapsed) {
      return null;
    }

    return (
      <View
        ref={ref}
        className={cn(
          'mx-3.5 flex flex-col gap-1 border-l border-sidebar-border px-2.5 py-1',
          className
        )}
        {...props}
      />
    );
  }
);

SidebarMenuSub.displayName = 'SidebarMenuSub';

type SidebarMenuSubItemProps = React.ComponentProps<typeof View>;

/**
 * Wrapper for a submenu item.
 */
const SidebarMenuSubItem = React.forwardRef<View, SidebarMenuSubItemProps>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={className} {...props} />;
  }
);

SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

type SidebarMenuSubButtonProps = React.ComponentProps<typeof Pressable> & {
  isActive?: boolean;
  size?: 'sm' | 'md';
  asChild?: boolean;
};

/**
 * Clickable button for submenu items.
 *
 * @remarks
 * - Smaller and more subtle than primary menu buttons
 * - Supports active state highlighting
 */
const SidebarMenuSubButton = React.forwardRef<View, SidebarMenuSubButtonProps>(
  ({ className, isActive, size = 'md', children, asChild, ...props }, ref) => {
    return (
      <TextClassContext.Provider
        value={cn(
          'text-sidebar-foreground',
          size === 'sm' ? 'text-xs' : 'text-sm',
          isActive && 'font-medium'
        )}>
        <Pressable
          ref={ref}
          className={cn(
            'flex w-full flex-row items-center gap-2 overflow-hidden rounded-md px-2',
            size === 'sm' ? 'h-7' : 'h-8',
            'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
            Platform.select({
              web: 'cursor-pointer outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            }),
            isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
            className
          )}
          {...props}>
          {typeof children === 'function' ? children : wrapTextChildren(children)}
        </Pressable>
      </TextClassContext.Provider>
    );
  }
);

SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export { SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem };

export type {
  SidebarMenuSubButtonProps,
  SidebarMenuSubItemProps,
  SidebarMenuSubProps,
};
