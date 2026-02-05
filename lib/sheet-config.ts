/**
 * iOS Sheet Configuration - Standardized sheet heights across the app
 *
 * Based on Apple's Human Interface Guidelines for sheets:
 * - Sheets should use standard detents for consistency
 * - Medium detent: ~50% of screen height
 * - Large detent: Nearly full screen with status bar visible
 */

// ============================================================================
// iOS Standard Detents
// ============================================================================

/**
 * Standard iOS sheet detent sizes
 * These match Apple's sheet presentation guidelines
 */
export const IOS_SHEET_DETENTS = {
  /** Small detent - compact preview, ~25% of screen */
  small: '25%',
  /** Medium detent - iOS standard half sheet, ~50% of screen */
  medium: '50%',
  /** Large detent - nearly full screen, leaves status bar visible */
  large: '92%',
} as const;

export type SheetDetent = keyof typeof IOS_SHEET_DETENTS;

// ============================================================================
// Snap Point Arrays
// ============================================================================

/**
 * Default snap points for modal sheets (medium + large)
 * Use for sheets that can expand from half to full
 */
export const DEFAULT_MODAL_SNAP_POINTS: (string | number)[] = [
  IOS_SHEET_DETENTS.medium,
  IOS_SHEET_DETENTS.large,
];

/**
 * Full range snap points (small + medium + large)
 * Use for persistent sheets that need peek state
 */
export const FULL_RANGE_SNAP_POINTS: (string | number)[] = [
  IOS_SHEET_DETENTS.small,
  IOS_SHEET_DETENTS.medium,
  IOS_SHEET_DETENTS.large,
];

/**
 * Compact snap points (small + medium)
 * Use for sheets that don't need full expansion
 */
export const COMPACT_SNAP_POINTS: (string | number)[] = [
  IOS_SHEET_DETENTS.small,
  IOS_SHEET_DETENTS.medium,
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the index for a detent in a snap points array
 */
export function getDetentIndex(
  detent: SheetDetent,
  snapPoints: (string | number)[] = FULL_RANGE_SNAP_POINTS
): number {
  const value = IOS_SHEET_DETENTS[detent];
  return snapPoints.indexOf(value);
}

/**
 * Convert a snap point index to a detent name
 */
export function indexToDetent(
  index: number,
  snapPoints: (string | number)[] = FULL_RANGE_SNAP_POINTS
): SheetDetent | null {
  const value = snapPoints[index];
  const entry = Object.entries(IOS_SHEET_DETENTS).find(([, v]) => v === value);
  return entry ? (entry[0] as SheetDetent) : null;
}

// ============================================================================
// Native Sheet Detents (for react-native-screens)
// ============================================================================

/**
 * Native iOS sheet detents as fractional values (0-1)
 * Used with react-native-screens sheetAllowedDetents option
 *
 * Based on Apple HIG: https://developer.apple.com/design/human-interface-guidelines/sheets
 * - Medium detent: approximately half the screen height
 * - Large detent: full height (leaving status bar visible)
 */
export const NATIVE_SHEET_DETENTS = {
  /** Standard iOS sheet: medium (half) + large (full) - matches Apple HIG */
  standard: [0.5, 1.0] as const,
  /** Modal sheets: medium (50%) + large (92%) */
  modal: [0.5, 0.92] as const,
  /** Full range: small (25%) + medium (50%) + large (100%) */
  fullRange: [0.25, 0.5, 1.0] as const,
  /** Compact: small (25%) + medium (50%) */
  compact: [0.25, 0.5] as const,
  /** Single detent at medium */
  mediumOnly: [0.5] as const,
  /** Single detent at large (full) */
  largeOnly: [1.0] as const,
} as const;

export type NativeSheetDetentPreset = keyof typeof NATIVE_SHEET_DETENTS;
