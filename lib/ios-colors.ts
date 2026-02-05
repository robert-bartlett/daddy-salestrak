/**
 * iOS System Colors
 *
 * Based on Apple Human Interface Guidelines
 * https://developer.apple.com/design/human-interface-guidelines/color
 *
 * These colors match the native iOS system colors for consistent appearance.
 */

export type ColorScheme = 'light' | 'dark';

/**
 * Get iOS system colors for the given color scheme
 */
export function getIOSColors(colorScheme: ColorScheme | null | undefined) {
  const isDark = colorScheme === 'dark';

  return {
    // Backgrounds
    systemBackground: isDark ? '#000000' : '#ffffff',
    secondarySystemBackground: isDark ? '#1c1c1e' : '#f2f2f7',
    tertiarySystemBackground: isDark ? '#2c2c2e' : '#ffffff',

    // Grouped backgrounds (for sheets, tables)
    systemGroupedBackground: isDark ? '#000000' : '#f2f2f7',
    secondarySystemGroupedBackground: isDark ? '#1c1c1e' : '#ffffff',
    tertiarySystemGroupedBackground: isDark ? '#2c2c2e' : '#f2f2f7',

    // Labels
    label: isDark ? '#ffffff' : '#000000',
    secondaryLabel: isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
    tertiaryLabel: isDark ? 'rgba(235, 235, 245, 0.3)' : 'rgba(60, 60, 67, 0.3)',
    quaternaryLabel: isDark ? 'rgba(235, 235, 245, 0.18)' : 'rgba(60, 60, 67, 0.18)',

    // Fills
    systemFill: isDark ? 'rgba(120, 120, 128, 0.36)' : 'rgba(120, 120, 128, 0.2)',
    secondarySystemFill: isDark ? 'rgba(120, 120, 128, 0.32)' : 'rgba(120, 120, 128, 0.16)',
    tertiarySystemFill: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)',
    quaternarySystemFill: isDark ? 'rgba(118, 118, 128, 0.18)' : 'rgba(118, 118, 128, 0.08)',

    // Separators
    separator: isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(60, 60, 67, 0.29)',
    opaqueSeparator: isDark ? '#38383a' : '#c6c6c8',

    // Grabber/Handle indicator
    grabberIndicator: isDark ? 'rgba(235, 235, 245, 0.3)' : 'rgba(60, 60, 67, 0.3)',

    // System colors
    systemBlue: '#007aff',
    systemGreen: '#34c759',
    systemIndigo: '#5856d6',
    systemOrange: '#ff9500',
    systemPink: '#ff2d55',
    systemPurple: '#af52de',
    systemRed: '#ff3b30',
    systemTeal: '#5ac8fa',
    systemYellow: '#ffcc00',
  };
}

/**
 * iOS Sheet-specific colors
 *
 * Native iOS formSheet modals use an elevated surface that sits above
 * the underlying content. In dark mode this is a raised gray (#1c1c1e),
 * in light mode it's typically white or grouped gray.
 */
export function getIOSSheetColors(colorScheme: ColorScheme | null | undefined) {
  const colors = getIOSColors(colorScheme);
  const isDark = colorScheme === 'dark';

  return {
    // Sheet surface background (native formSheet uses elevated surface)
    // Dark: #1c1c1e (secondarySystemBackground) - elevated gray
    // Light: #f2f2f7 (systemGroupedBackground) - grouped gray
    background: isDark ? colors.secondarySystemBackground : colors.systemGroupedBackground,

    // Card/row backgrounds within the sheet
    // Dark: #2c2c2e (tertiarySystemBackground) - slightly lighter than sheet
    // Light: #ffffff - white cards on gray background
    cardBackground: isDark ? colors.tertiarySystemBackground : '#ffffff',
    rowBackground: isDark ? colors.tertiarySystemBackground : '#ffffff',

    // Text colors
    title: colors.label,
    subtitle: colors.secondaryLabel,

    // Grabber handle
    grabber: colors.grabberIndicator,

    // Separator
    separator: colors.separator,

    // Icon background
    iconBackground: colors.tertiarySystemFill,

    // Accent color (iOS blue)
    accent: colors.systemBlue,
  };
}
