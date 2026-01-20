import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View, type TextInputProps } from 'react-native';
import { useSidebar } from './sidebar-context';

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
 */
const SidebarRail = React.forwardRef<View, SidebarRailProps>(
  ({ className, onPress, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Pressable
        ref={ref}
        className={cn(
          'absolute right-0 top-0 z-20 h-full w-4 -translate-x-1/2 active:opacity-100',
          Platform.select({
            web: 'cursor-ew-resize hover:opacity-100',
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
