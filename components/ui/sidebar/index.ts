// Context and Provider
export {
  SidebarContext,
  SidebarProvider,
  useSidebar,
} from './sidebar-context';

export type {
  SidebarContextValue,
  SidebarProviderProps,
  SidebarState,
  SidebarVariant,
} from './sidebar-context';

// Main Sidebar and Layout Components
export {
  Sidebar,
  SidebarContent,
  SidebarErrorBoundary,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  useSidebarInternal,
} from './sidebar';

export type {
  SidebarContentProps,
  SidebarErrorBoundaryProps,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarInsetProps,
  SidebarInternalContextValue,
  SidebarProps,
} from './sidebar';

// Group Components
export {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from './sidebar-group';

export type {
  SidebarGroupActionProps,
  SidebarGroupContentProps,
  SidebarGroupLabelProps,
  SidebarGroupProps,
} from './sidebar-group';

// Menu Components
export {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  sidebarMenuButtonVariants,
} from './sidebar-menu';

export type {
  SidebarMenuActionProps,
  SidebarMenuBadgeProps,
  SidebarMenuButtonProps,
  SidebarMenuItemProps,
  SidebarMenuProps,
  SidebarMenuSkeletonProps,
} from './sidebar-menu';

// Submenu Components
export {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from './sidebar-submenu';

export type {
  SidebarMenuSubButtonProps,
  SidebarMenuSubItemProps,
  SidebarMenuSubProps,
} from './sidebar-submenu';

// Widget Components (trigger, rail, input, separator)
export {
  SidebarInput,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './sidebar-widgets';

export type {
  SidebarInputProps,
  SidebarRailProps,
  SidebarSeparatorProps,
  SidebarTriggerProps,
} from './sidebar-widgets';

// Constants
export {
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_WIDTH_MOBILE,
  SIDEBAR_WIDTH_REM,
  SIDEBAR_WIDTH_ICON_REM,
  SIDEBAR_WIDTH_MOBILE_REM,
} from './sidebar-constants';
