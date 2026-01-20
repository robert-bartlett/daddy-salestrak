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
 * Internal context for passing sidebar configuration to children
 */
const SidebarInternalContext = React.createContext<{
  collapsible: 'offcanvas' | 'icon' | 'none';
  variant: 'sidebar' | 'floating' | 'inset';
  side: 'left' | 'right';
} | null>(null);

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

    const internalContext = React.useMemo(
      () => ({ collapsible, variant: variant ?? 'sidebar', side: side ?? 'left' }),
      [collapsible, variant, side]
    );

    // Mobile: Use Sheet component
    // We need to re-provide the SidebarContext inside the portal because portal content
    // renders at the PortalHost location which is outside the original context tree
    if (isMobile) {
      return (
        <SidebarInternalContext.Provider value={internalContext}>
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent
              side={side}
              showCloseButton={false}
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
        </SidebarInternalContext.Provider>
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
    const isCollapsed = state === 'collapsed';
    const width = isCollapsed
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
            collapsible === 'offcanvas' && isCollapsed && 'hidden'
          )}
          style={{ width }}
          {...props}>
          <View
            className={cn(
              sidebarVariants({ variant, side }),
              'h-full',
              collapsible === 'icon' && isCollapsed && 'items-center overflow-hidden'
            )}
            style={{ width: collapsible === 'icon' && isCollapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH }}>
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
export type { SidebarProps, SidebarInsetProps };
