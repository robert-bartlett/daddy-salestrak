import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../text';
import {
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_WIDTH_MOBILE,
} from './sidebar-constants';
import { SidebarContext, useSidebar } from './sidebar-context';
import {
  SidebarInternalContext,
  type SidebarInternalContextValue,
} from './sidebar-internal-context';

// ============================================================================
// Error Boundary
// ============================================================================

type SidebarErrorBoundaryProps = {
  children: React.ReactNode;
  /** Fallback UI to render when an error occurs. Receives error and reset function. */
  fallback?: React.ReactNode | ((props: { error: Error; reset: () => void }) => React.ReactNode);
  /** Called when an error is caught. Use for logging/reporting. */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type SidebarErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Error boundary for sidebar components.
 *
 * @remarks
 * - Catches JavaScript errors anywhere in the sidebar component tree
 * - Displays a fallback UI instead of crashing the entire app
 * - Provides a reset mechanism to retry rendering
 * - Supports custom fallback UI and error reporting callbacks
 *
 * @example
 * ```tsx
 * <SidebarErrorBoundary
 *   onError={(error) => console.error('Sidebar error:', error)}
 *   fallback={<Text>Something went wrong</Text>}
 * >
 *   <SidebarProvider>
 *     <Sidebar>...</Sidebar>
 *   </SidebarProvider>
 * </SidebarErrorBoundary>
 * ```
 */
class SidebarErrorBoundary extends React.Component<
  SidebarErrorBoundaryProps,
  SidebarErrorBoundaryState
> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SidebarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      // Custom fallback provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback({ error: this.state.error, reset: this.reset });
        }
        return fallback;
      }

      // Default fallback UI - minimal sidebar-shaped placeholder
      return (
        <View className="flex h-full w-16 flex-col items-center justify-center bg-sidebar-background p-2">
          <AlertTriangle size={20} className="mb-2 text-destructive" />
          <Pressable
            onPress={this.reset}
            className="rounded px-2 py-1"
            accessibilityRole="button"
            accessibilityLabel="Retry loading sidebar">
            <Text className="text-xs text-muted-foreground">Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const sidebarVariants = cva(
  'flex h-full flex-col bg-sidebar-background text-sidebar-foreground',
  {
    variants: {
      variant: {
        // border-e = end border (right in LTR, left in RTL)
        sidebar: 'border-e border-sidebar-border',
        floating: 'm-2 rounded-lg border border-sidebar-border shadow-lg',
        inset: '',
      },
      side: {
        left: '',
        // border-s = start border (left in LTR, right in RTL)
        right: 'border-s border-e-0',
      },
    },
    compoundVariants: [
      {
        variant: 'floating',
        side: 'right',
        className: 'border-s border-e',
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
      style,
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
      () => ({ collapsible, variant, side, isCollapsed }),
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
            ref={ref}
            side={side}
            className={cn('bg-sidebar-background p-0', className)}
            style={[{ width: SIDEBAR_WIDTH_MOBILE }, style]}
            {...props}>
            {/* Dialog content needs a title for screen readers; keep it visually hidden. */}
            <SheetTitle className="sr-only">Sidebar navigation</SheetTitle>
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
            style={[{ width: SIDEBAR_WIDTH }, style]}
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
    const collapsedWidth = collapsible === 'icon' ? SIDEBAR_WIDTH_ICON : 0;
    const width = isStateCollapsed ? collapsedWidth : SIDEBAR_WIDTH;

    return (
      <SidebarInternalContext.Provider value={internalContext}>
        <View
          ref={ref}
          className={cn(
            'shrink-0',
            Platform.select({ web: 'transition-[width] duration-200 ease-linear motion-reduce:transition-none', default: '' }),
            collapsible === 'offcanvas' && isStateCollapsed && 'hidden'
          )}
          style={[{ width }, style]}
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
          !isInset && Platform.select({ web: 'min-h-screen', default: '' }),
          // Inset variant: rounded card effect on desktop with proper height
          // me-2 = margin-end (right in LTR, left in RTL)
          isInset && !isMobile && 'my-2 me-2 rounded-xl shadow-lg overflow-hidden',
          className
        )}
        {...props}>
        {children}
      </View>
    );
  }
);

SidebarInset.displayName = 'SidebarInset';

// ============================================================================
// Layout Components
// ============================================================================

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

export { Sidebar, SidebarContent, SidebarErrorBoundary, SidebarFooter, SidebarHeader, SidebarInset };
export type {
  SidebarContentProps,
  SidebarErrorBoundaryProps,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarInsetProps,
  SidebarProps,
};
