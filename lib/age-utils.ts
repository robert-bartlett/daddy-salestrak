import type { ProjectStatus, AgeUpdateReason } from './mock-data';

/**
 * Formats a date as an abbreviated age string relative to now.
 * Examples: "0m", "2w", "1mo", "1y"
 */
export function formatAge(ageResetAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - ageResetAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears >= 1) {
    return `${diffYears}y`;
  }
  if (diffMonths >= 1) {
    return `${diffMonths}mo`;
  }
  if (diffWeeks >= 1) {
    return `${diffWeeks}w`;
  }
  if (diffDays >= 1) {
    return `${diffDays}d`;
  }
  return `${diffMinutes}m`;
}

/**
 * Derives the project status based on age.
 * - Months or years = Off track (red)
 * - Weeks = At risk (yellow)
 * - Days or less = On track (green)
 */
export function getStatusFromAge(ageResetAt: Date): ProjectStatus {
  const now = new Date();
  const diffMs = now.getTime() - ageResetAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths >= 1) {
    return 'off_track';
  }
  if (diffWeeks >= 1) {
    return 'at_risk';
  }
  return 'on_track';
}

/**
 * Calculates age in days from a reset date.
 */
export function calculateAgeInDays(ageResetAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - ageResetAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export type BadgeColor = 'green' | 'yellow' | 'red' | 'grey';

export const STATUS_OPTIONS: { value: ProjectStatus; label: string; badgeColor: BadgeColor }[] = [
  { value: 'on_track', label: 'On track', badgeColor: 'green' },
  { value: 'at_risk', label: 'At risk', badgeColor: 'yellow' },
  { value: 'off_track', label: 'Off track', badgeColor: 'red' },
  { value: 'disabled', label: 'Disable age', badgeColor: 'grey' },
];

export const REASON_OPTIONS: { value: AgeUpdateReason; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'knock_no_contact', label: 'Knock no contact' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'inspection_scheduled', label: 'Inspection scheduled' },
  { value: 'inspection_completed', label: 'Inspection completed' },
  { value: 'contract_signed', label: 'Contract signed' },
];

/**
 * Gets the human-readable label for a status value.
 */
export function getStatusLabel(status: ProjectStatus): string {
  return STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? status;
}

/**
 * Gets the badge color for a status value.
 */
export function getStatusBadgeColor(status: ProjectStatus): BadgeColor {
  switch (status) {
    case 'on_track':
      return 'green';
    case 'at_risk':
      return 'yellow';
    case 'off_track':
      return 'red';
    case 'disabled':
      return 'grey';
    default:
      return 'grey';
  }
}

/**
 * Gets the text color class for a status value.
 * Uses 500 shade which is vibrant in both light and dark modes.
 */
export function getStatusTextColor(status: ProjectStatus): string {
  switch (status) {
    case 'on_track':
      return 'text-green-500';
    case 'at_risk':
      return 'text-yellow-500';
    case 'off_track':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Gets the hex color for a status value (for inline styles).
 */
export function getStatusHexColor(status: ProjectStatus): string {
  switch (status) {
    case 'on_track':
      return '#22c55e'; // green-500
    case 'at_risk':
      return '#eab308'; // yellow-500
    case 'off_track':
      return '#ef4444'; // red-500
    case 'disabled':
      return '#9ca3af'; // gray-400
    default:
      return '#9ca3af'; // gray-400
  }
}

/**
 * Gets the human-readable label for a reason value.
 */
export function getReasonLabel(reason: AgeUpdateReason): string {
  return REASON_OPTIONS.find((opt) => opt.value === reason)?.label ?? reason;
}
