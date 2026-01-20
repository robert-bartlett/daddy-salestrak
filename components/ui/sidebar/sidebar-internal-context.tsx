import * as React from 'react';

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
 * Internal context for passing sidebar configuration to children.
 */
const SidebarInternalContext = React.createContext<SidebarInternalContextValue | null>(null);

function useSidebarInternal() {
  return React.useContext(SidebarInternalContext);
}

export { SidebarInternalContext, useSidebarInternal };
export type { SidebarInternalContextValue };
