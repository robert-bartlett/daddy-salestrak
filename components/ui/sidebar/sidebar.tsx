import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { SidebarContext, useSidebar } from './sidebar-context';

// Sidebar width constants (matching CSS variables)
const SIDEBAR_WIDTH = 256; // 16rem
const SIDEBAR_WIDTH_ICON = 48; // 3rem
const SIDEBAR_WIDTH_MOBILE = 288; // 18rem

const sidebarVariants = cva(
  'flex h-full flex-col bg-sidebar-background text-sidebar-foreground',
  {
    variants: {
      variant: {
        sidebar: 'border-r border-sidebar-border',
        floating: 'm-2 rounded-lg border border-sidebar-border shadow-lg',
        inset: '',
      },
      side: {
        left: '',
        right: 'border-l border-r-0',
      },
    },
    compoundVariants: [
      {
        variant: 'floating',
        side: 'right',
        className: 'border-l border-r',
      },
    ],
    defaultVariants: {
      variant: 'sidebar',
      side: 'left',
    },
  }
);

type SidebarProps = React.ComponentProps<typeof View> & {
  collapsible?: 'offcanvas' | 'icon' | 'none';
  side?: 'left' | 'right';
};

/**
 * Configuration values passed from Sidebar to child components.
 * Includes derived `isCollapsed` to avoid repeated calculations in children.
 */
type SidebarInternalContextValue = {
  collapsible: 'offcanvas' | 'icon' | 'none';
  variant: 'sidebar' | 'floating' | 'inset';
  side: 'left' | 'right';
  /** True when sidebar is in collapsed icon mode on desktop. Always false on mobile. */
  isCollapsed: boolean;
};

/**
 * Internal context for passing sidebar configuration to children
 */
const SidebarInternalContext = React.createContext<SidebarInternalContextValue | null>(null);

function useSidebarInternal() {
  return React.useContext(SidebarInternalContext);
}

/**
 * Main sidebar container component.
 *
 * @remarks
 * - On mobile: Renders as a Sheet that slides in from the side
 * - On desktop: Renders as a fixed sidebar with collapsible modes
 * - Supports 'offcanvas' (hide completely), 'icon' (collapse to icons), or 'none' (always expanded)
 */
const Sidebar = React.forwardRef<View, SidebarProps>(
  (
    {
      className,
      children,
      collapsible = 'offcanvas',
      side = 'left',
      ...props
    },
    ref
  ) => {
    // Get the full sidebar context to bridge it through the portal
    const sidebarContext = useSidebar();
    const { isMobile, state, openMobile, setOpenMobile, variant } = sidebarContext;

    // Compute isCollapsed once here to avoid repeated calculations in child components
    // On mobile, sidebar always shows expanded in the sheet (isCollapsed = false)
    const isCollapsed = !isMobile && state === 'collapsed' && collapsible === 'icon';

    const internalContext = React.useMemo<SidebarInternalContextValue>(
      () => ({ collapsible, variant: variant ?? 'sidebar', side: side ?? 'left', isCollapsed }),
      [collapsible, variant, side, isCollapsed]
    );

    // Mobile: Use Sheet component
    // Portal Context Bridging: SheetContent renders its children via a Portal at the
    // PortalHost location (typically at the app root), which is outside the original
    // React context tree. We must re-provide both SidebarContext and SidebarInternalContext
    // inside the portal so that child components (menu items, groups, etc.) can access
    // sidebar state and configuration. Without this, useContext calls would return null
    // or default values instead of the actual sidebar state.
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className={cn(
              'w-[--sidebar-width-mobile] bg-sidebar-background p-0',
              className
            )}
            style={{ width: SIDEBAR_WIDTH_MOBILE }}>
            <SidebarContext.Provider value={sidebarContext}>
              <SidebarInternalContext.Provider value={internalContext}>
                <View className="flex h-full flex-col">{children}</View>
              </SidebarInternalContext.Provider>
            </SidebarContext.Provider>
          </SheetContent>
        </Sheet>
      );
    }

    // Non-collapsible sidebar
    if (collapsible === 'none') {
      return (
        <SidebarInternalContext.Provider value={internalContext}>
          <View
            ref={ref}
            className={cn(sidebarVariants({ variant, side }), className)}
            style={{ width: SIDEBAR_WIDTH }}
            {...props}>
            {children}
          </View>
        </SidebarInternalContext.Provider>
      );
    }

    // Desktop collapsible sidebar
    // Note: isCollapsed (from above) is specifically for icon-only mode used by children.
    // Here we use state directly for layout calculations that apply to any collapsible mode.
    const isStateCollapsed = state === 'collapsed';
    const width = isStateCollapsed
      ? collapsible === 'icon'
        ? SIDEBAR_WIDTH_ICON
        : 0
      : SIDEBAR_WIDTH;

    return (
      <SidebarInternalContext.Provider value={internalContext}>
        <View
          ref={ref}
          className={cn(
            'shrink-0',
            Platform.select({ web: 'transition-[width] duration-200 ease-linear' }),
            collapsible === 'offcanvas' && isStateCollapsed && 'hidden'
          )}
          style={{ width }}
          {...props}>
          <View
            className={cn(
              sidebarVariants({ variant, side }),
              'h-full',
              collapsible === 'icon' && isStateCollapsed && 'items-center overflow-hidden'
            )}
            style={{ width: collapsible === 'icon' && isStateCollapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH }}>
            {children}
          </View>
        </View>
      </SidebarInternalContext.Provider>
    );
  }
);

Sidebar.displayName = 'Sidebar';

type SidebarInsetProps = React.ComponentProps<typeof View>;

/**
 * Main content area wrapper that adjusts based on sidebar state.
 *
 * @remarks
 * - Automatically adjusts margin/padding based on sidebar visibility
 * - Use this to wrap your main application content
 * - When variant is "inset", applies rounded corners, margin, and shadow
 */
const SidebarInset = React.forwardRef<View, SidebarInsetProps>(
  ({ className, children, ...props }, ref) => {
    const { variant, isMobile } = useSidebar();
    const isInset = variant === 'inset';

    return (
      <View
        ref={ref}
        className={cn(
          'relative flex flex-1 flex-col bg-background',
          // Non-inset: use min-h-screen for full height
          !isInset && Platform.select({ web: 'min-h-screen' }),
          // Inset variant: rounded card effect on desktop with proper height
          isInset && !isMobile && 'my-2 mr-2 rounded-xl shadow-lg overflow-hidden',
          className
        )}
        {...props}>
        {children}
      </View>
    );
  }
);

SidebarInset.displayName = 'SidebarInset';

export { Sidebar, SidebarInset, useSidebarInternal };
export type { SidebarInternalContextValue, SidebarInsetProps, SidebarProps };
