import { useIsMobile } from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, View } from 'react-native';

// Storage key for persisting sidebar state (web only)
const SIDEBAR_STORAGE_KEY = 'sidebar_state';

// Keyboard shortcut: Cmd+B (Mac) / Ctrl+B (Windows)
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarState = 'expanded' | 'collapsed';
type SidebarVariant = 'sidebar' | 'floating' | 'inset';

type SidebarContextValue = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  variant: SidebarVariant;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

type SidebarProviderProps = {
  /** Initial open state for desktop (uncontrolled mode) */
  defaultOpen?: boolean;
  /** Controlled open state for desktop */
  open?: boolean;
  /** Callback when desktop open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Initial open state for mobile sheet (uncontrolled mode) */
  defaultOpenMobile?: boolean;
  /** Controlled open state for mobile sheet */
  openMobile?: boolean;
  /** Callback when mobile sheet open state changes */
  onOpenMobileChange?: (open: boolean) => void;
  variant?: SidebarVariant;
  children: React.ReactNode;
};

/**
 * Provider component that manages sidebar state and provides context to children.
 *
 * @remarks
 * - Persists sidebar state to localStorage on web
 * - Supports both controlled and uncontrolled modes
 * - Handles keyboard shortcut (Cmd/Ctrl+B) on web
 * - Automatically collapses to sheet on mobile viewports
 */
function SidebarProvider({
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultOpenMobile = false,
  openMobile: controlledOpenMobile,
  onOpenMobileChange: setControlledOpenMobile,
  variant = 'sidebar',
  children,
}: SidebarProviderProps) {
  const { colorScheme } = useColorScheme();
  const isMobile = useIsMobile();

  // Internal state for mobile (uncontrolled mode)
  const [_openMobile, _setOpenMobile] = React.useState(defaultOpenMobile);

  // Internal state for uncontrolled mode
  const [_open, _setOpen] = React.useState(() => {
    // Load persisted state on web only
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        const persisted = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (persisted === 'true') return true;
        if (persisted === 'false') return false;
      } catch {
        // Silently ignore storage errors
      }
    }
    return defaultOpen;
  });

  const open = controlledOpen ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((prevState: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setControlledOpen) {
        setControlledOpen(openState);
      } else {
        _setOpen(openState);
      }

      // Persist state to localStorage on web
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(openState));
        } catch {
          // Silently ignore storage errors
        }
      }
    },
    [open, setControlledOpen]
  );

  // Derive mobile open state (controlled or uncontrolled)
  const openMobile = controlledOpenMobile ?? _openMobile;

  const setOpenMobile = React.useCallback(
    (value: boolean | ((prevState: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(openMobile) : value;
      if (setControlledOpenMobile) {
        setControlledOpenMobile(openState);
      } else {
        _setOpenMobile(openState);
      }
    },
    [openMobile, setControlledOpenMobile]
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile, setOpen, setOpenMobile]);

  // Keyboard shortcut for web only
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state: SidebarState = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      variant,
    }),
    [state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar, variant]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <View
        className={cn(
          'flex flex-1 flex-row',
          // On native, explicitly apply dark class for CSS variables to work in this tree
          Platform.OS !== 'web' && colorScheme === 'dark' && 'dark',
          // Apply background color on all platforms, with web-specific height classes
          variant === 'inset'
            ? cn('bg-sidebar-background', Platform.select({ web: 'h-screen' }))
            : cn('bg-background', Platform.select({ web: 'min-h-screen' }))
        )}>
        {children}
      </View>
    </SidebarContext.Provider>
  );
}

/**
 * Hook to access sidebar context.
 * Must be used within a SidebarProvider.
 */
function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export { SidebarContext, SidebarProvider, useSidebar };
export type { SidebarContextValue, SidebarProviderProps, SidebarState, SidebarVariant };
