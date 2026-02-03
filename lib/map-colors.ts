// Map badge colors to hex values for map markers
// Using the 500 shade for good visibility on maps

import type { BadgeColor } from './mock-data';

export const PIN_COLORS: Record<BadgeColor, string> = {
  grey: '#6B7280',
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  'light-green': '#84CC16',
  green: '#22C55E',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  'light-blue': '#0EA5E9',
  blue: '#3B82F6',
  purple: '#A855F7',
  'light-purple': '#A78BFA',
  violet: '#8B5CF6',
  magenta: '#D946EF',
  pink: '#EC4899',
};

export function getPinColor(color: BadgeColor): string {
  return PIN_COLORS[color] ?? PIN_COLORS.grey;
}
