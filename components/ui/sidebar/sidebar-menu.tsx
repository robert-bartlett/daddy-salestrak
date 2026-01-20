import { Skeleton } from '@/components/ui/skeleton';
import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { I18nManager, Platform, Pressable, View } from 'react-native';
import { useSidebar } from './sidebar-context';
import { useSidebarInternal } from './sidebar';

type SidebarMenuProps = React.ComponentProps<typeof View>;

/**
 * Container for sidebar menu items.
 */
const SidebarMenu = React.forwardRef<View, SidebarMenuProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('flex w-full flex-col gap-1', className)}
        {...props}
      />
    );
  }
);

SidebarMenu.displayName = 'SidebarMenu';

type SidebarMenuItemProps = React.ComponentProps<typeof View>;

/**
 * Wrapper for a single menu item.
 */
const SidebarMenuItem = React.forwardRef<View, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('group relative', className)}
        {...props}
      />
    );
  }
);

SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
  cn(
    'flex w-full flex-row items-center gap-2 overflow-hidden rounded-md p-2',
    Platform.select({
      web: 'cursor-pointer outline-none ring-offset-background transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2',
      default: '',
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
          Platform.select({
            web: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            default: '',
          })
        ),
        outline: cn(
          'border border-sidebar-border bg-transparent shadow-sm active:bg-sidebar-accent active:text-sidebar-accent-foreground',
          Platform.select({
            web: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            default: '',
          })
        ),
      },
      size: {
        default: 'h-9 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type SidebarMenuButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    isActive?: boolean;
    tooltip?: string | React.ReactNode;
  };

/**
 * Clickable menu button with optional tooltip.
 *
 * @remarks
 * - Shows tooltip in collapsed icon mode
 * - Supports active state styling
 * - Icons should be first child, text should be second
 */
const SidebarMenuButton = React.forwardRef<View, SidebarMenuButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isActive,
      tooltip,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile } = useSidebar();
    const internal = useSidebarInternal();
    const isCollapsed = internal?.isCollapsed ?? false;

    const button = (
      <TextClassContext.Provider
        value={cn(
          'text-sm text-sidebar-foreground',
          isActive && 'font-medium'
        )}>
        <Pressable
          ref={ref}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={isCollapsed && typeof tooltip === 'string' ? tooltip : undefined}
          className={cn(
            sidebarMenuButtonVariants({ variant, size }),
            isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
            isCollapsed && 'justify-center px-2',
            className
          )}
          {...props}>
          {typeof children === 'function'
            ? children
            : isCollapsed
            ? // In collapsed mode, only show the first child (icon)
              React.Children.toArray(children)[0]
            : wrapTextChildren(children)}
        </Pressable>
      </TextClassContext.Provider>
    );

    // Show tooltip in collapsed mode (desktop only)
    // Tooltip appears on opposite side of sidebar (end side, accounting for RTL)
    if (isCollapsed && tooltip && !isMobile) {
      const tooltipSide = I18nManager.isRTL ? 'left' : 'right';
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side={tooltipSide} sideOffset={4}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

SidebarMenuButton.displayName = 'SidebarMenuButton';

type SidebarMenuActionProps = React.ComponentProps<typeof Pressable> & {
  showOnHover?: boolean;
};

/**
 * Secondary action button within a menu item.
 *
 * @remarks
 * - Positioned on the right side of the menu item
 * - Hidden when sidebar is collapsed
 */
const SidebarMenuAction = React.forwardRef<View, SidebarMenuActionProps>(
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
          // end-1 = position from end edge (right in LTR, left in RTL)
          'absolute end-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-70 active:opacity-100',
          Platform.select({
            web: cn(
              'hover:opacity-100 focus-visible:opacity-100',
              // showOnHover: hide by default, reveal on parent hover/focus (web only)
              showOnHover && 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            ),
            default: '',
          }),
          // On native, showOnHover is ignored - actions are always visible since there's no hover
          className
        )}
        {...props}
      />
    );
  }
);

SidebarMenuAction.displayName = 'SidebarMenuAction';

type SidebarMenuBadgeProps = React.ComponentProps<typeof View> & {
  children?: React.ReactNode;
};

/**
 * Badge indicator for menu items.
 *
 * @remarks
 * - Shows notification counts or status indicators
 * - Hidden when sidebar is collapsed
 */
const SidebarMenuBadge = React.forwardRef<View, SidebarMenuBadgeProps>(
  ({ className, children, ...props }, ref) => {
    const internal = useSidebarInternal();

    if (internal?.isCollapsed) {
      return null;
    }

    return (
      <TextClassContext.Provider value="text-xs text-sidebar-foreground tabular-nums">
        <View
          ref={ref}
          accessibilityRole="text"
          accessibilityLabel={typeof children === 'string' || typeof children === 'number' ? `${children}` : undefined}
          className={cn(
            // end-1 = position from end edge (right in LTR, left in RTL)
            'absolute end-1 top-1/2 -translate-y-1/2 flex min-h-5 min-w-5 items-center justify-center rounded-md px-1',
            className
          )}
          {...props}>
          {wrapTextChildren(children)}
        </View>
      </TextClassContext.Provider>
    );
  }
);

SidebarMenuBadge.displayName = 'SidebarMenuBadge';

type SidebarMenuSkeletonProps = React.ComponentProps<typeof View> & {
  showIcon?: boolean;
};

/**
 * Loading placeholder for menu items.
 */
/** Returns a random percentage width between 50% and 90% as a typed DimensionValue. */
function getRandomSkeletonWidth(): `${number}%` {
  const percent = Math.floor(Math.random() * 40) + 50;
  return `${percent}%` as `${number}%`;
}

const SidebarMenuSkeleton = React.forwardRef<View, SidebarMenuSkeletonProps>(
  ({ className, showIcon = false, ...props }, ref) => {
    const width = React.useMemo(getRandomSkeletonWidth, []);

    return (
      <View
        ref={ref}
        className={cn('flex h-9 flex-row items-center gap-2 rounded-md px-2', className)}
        {...props}>
        {showIcon && <Skeleton className="size-4 rounded-md" />}
        <Skeleton
          className="h-4 max-w-40 flex-1"
          style={{ width }}
        />
      </View>
    );
  }
);

SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

export {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  sidebarMenuButtonVariants,
};

export type {
  SidebarMenuActionProps,
  SidebarMenuBadgeProps,
  SidebarMenuButtonProps,
  SidebarMenuItemProps,
  SidebarMenuProps,
  SidebarMenuSkeletonProps,
};
