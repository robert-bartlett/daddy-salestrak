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
