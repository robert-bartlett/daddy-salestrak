/**
 * Sidebar width constants.
 *
 * These values are the single source of truth for sidebar dimensions.
 * They are used in sidebar.tsx for inline styles (required for React Native).
 *
 * The corresponding CSS variables in global.css (--sidebar-width, --sidebar-width-icon,
 * --sidebar-width-mobile) should match these values. Those CSS variables exist for
 * web-only consumers who may want to reference sidebar dimensions in custom CSS.
 *
 * Conversion: 1rem = 16px (browser default)
 */

/** Expanded sidebar width: 16rem = 256px */
export const SIDEBAR_WIDTH = 256;

/** Icon-only collapsed sidebar width: 3rem = 48px */
export const SIDEBAR_WIDTH_ICON = 48;

/** Mobile sidebar sheet width: 18rem = 288px */
export const SIDEBAR_WIDTH_MOBILE = 288;

/** Width values in rem (for reference or CSS-in-JS usage) */
export const SIDEBAR_WIDTH_REM = '16rem';
export const SIDEBAR_WIDTH_ICON_REM = '3rem';
export const SIDEBAR_WIDTH_MOBILE_REM = '18rem';
