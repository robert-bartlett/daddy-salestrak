import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View, type TextInputProps } from 'react-native';
import { useSidebar } from './sidebar-context';
import { useSidebarInternal } from './sidebar';

type SidebarSeparatorProps = React.ComponentProps<typeof Separator>;

/**
 * Visual divider for sidebar sections.
 */
const SidebarSeparator = React.forwardRef<View, SidebarSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        className={cn('mx-2 w-auto bg-sidebar-border', className)}
        {...props}
      />
    );
  }
);

SidebarSeparator.displayName = 'SidebarSeparator';

type SidebarTriggerProps = React.ComponentProps<typeof Button>;

/**
 * Button to toggle sidebar open/closed state.
 *
 * @remarks
 * - Shows panel icon
 * - Toggles between mobile sheet and desktop collapsed modes
 */
const SidebarTrigger = React.forwardRef<View, SidebarTriggerProps>(
  ({ className, onPress, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        accessibilityLabel="Toggle sidebar"
        className={cn('size-8', className)}
        onPress={(e) => {
          onPress?.(e);
          toggleSidebar();
        }}
        {...props}>
        <Icon as={PanelLeft} className="text-foreground" size={16} />
      </Button>
    );
  }
);

SidebarTrigger.displayName = 'SidebarTrigger';

type SidebarRailProps = React.ComponentProps<typeof Pressable>;

/**
 * Clickable rail on the edge of collapsed sidebar.
 *
 * @remarks
 * - Only visible when sidebar can be collapsed
 * - Click to toggle sidebar state
 * - Provides additional hit target for toggling
 * - Positioned to straddle the sidebar edge (half inside, half outside)
 * - Uses physical positioning (left/right) intentionally, as it depends on the
 *   physical `side` prop, not text direction. The sidebar's screen position
 *   is a layout decision that doesn't change with RTL.
 */
const SidebarRail = React.forwardRef<View, SidebarRailProps>(
  ({ className, onPress, ...props }, ref) => {
    const { toggleSidebar, state } = useSidebar();
    const internal = useSidebarInternal();
    const side = internal?.side ?? 'left';
    const isCollapsed = state === 'collapsed';

    // Position rail on the edge of sidebar:
    // - Left sidebar: rail on right edge (right-0, translate-x-1/2 to center on edge)
    // - Right sidebar: rail on left edge (left-0, -translate-x-1/2 to center on edge)
    const isLeft = side === 'left';

    return (
      <Pressable
        ref={ref}
        className={cn(
          'absolute top-0 z-20 h-full w-4 active:opacity-100',
          isLeft ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2',
          Platform.select({
            web: cn(
              'outline-none hover:opacity-100 focus-visible:opacity-100',
              // Focus indicator: vertical line at center of rail
              'focus-visible:after:absolute focus-visible:after:inset-y-0 focus-visible:after:left-1/2 focus-visible:after:w-0.5 focus-visible:after:-translate-x-1/2 focus-visible:after:bg-sidebar-ring',
              // Cursor indicates resize direction based on side and collapsed state
              isLeft
                ? isCollapsed ? 'cursor-e-resize' : 'cursor-w-resize'
                : isCollapsed ? 'cursor-w-resize' : 'cursor-e-resize'
            ),
            default: '',
          }),
          className
        )}
        onPress={(e) => {
          onPress?.(e);
          toggleSidebar();
        }}
        accessibilityRole="button"
        accessibilityLabel="Toggle sidebar"
        {...props}
      />
    );
  }
);

SidebarRail.displayName = 'SidebarRail';

type SidebarInputProps = TextInputProps & {
  disabled?: boolean;
  invalid?: boolean;
};

/**
 * Search input styled for the sidebar.
 *
 * @remarks
 * - Uses sidebar color scheme
 * - Reduced height to fit sidebar density
 */
const SidebarInput = React.forwardRef<React.ComponentRef<typeof Input>, SidebarInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'h-8 bg-sidebar-background shadow-none focus-visible:ring-sidebar-ring',
          className
        )}
        {...props}
      />
    );
  }
);

SidebarInput.displayName = 'SidebarInput';

export { SidebarInput, SidebarRail, SidebarSeparator, SidebarTrigger };

export type {
  SidebarInputProps,
  SidebarRailProps,
  SidebarSeparatorProps,
  SidebarTriggerProps,
};
