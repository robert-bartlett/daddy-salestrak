import { cn } from '@/lib/utils';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

type SidebarHeaderProps = React.ComponentProps<typeof View>;

/**
 * Header section of the sidebar.
 *
 * @remarks
 * - Renders at the top of the sidebar
 * - Typically contains logo, branding, or user info
 * - Does not scroll with content
 */
const SidebarHeader = React.forwardRef<View, SidebarHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('flex flex-col gap-2 p-2', className)}
        {...props}
      />
    );
  }
);

SidebarHeader.displayName = 'SidebarHeader';

type SidebarContentProps = React.ComponentProps<typeof ScrollView> & {
  children?: React.ReactNode;
};

/**
 * Main scrollable content area of the sidebar.
 *
 * @remarks
 * - Contains the primary navigation items
 * - Scrolls independently when content overflows
 * - Use SidebarGroup components within this area
 */
const SidebarContent = React.forwardRef<ScrollView, SidebarContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        className={cn('flex-1', className)}
        contentContainerClassName="flex flex-col gap-2 p-2"
        showsVerticalScrollIndicator={false}
        {...props}>
        {children}
      </ScrollView>
    );
  }
);

SidebarContent.displayName = 'SidebarContent';

type SidebarFooterProps = React.ComponentProps<typeof View>;

/**
 * Footer section of the sidebar.
 *
 * @remarks
 * - Renders at the bottom of the sidebar
 * - Typically contains settings, logout, or secondary actions
 * - Does not scroll with content
 */
const SidebarFooter = React.forwardRef<View, SidebarFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('flex flex-col gap-2 p-2', className)}
        {...props}
      />
    );
  }
);

SidebarFooter.displayName = 'SidebarFooter';

export { SidebarContent, SidebarFooter, SidebarHeader };
export type { SidebarContentProps, SidebarFooterProps, SidebarHeaderProps };
