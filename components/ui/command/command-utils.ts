/**
 * Command Utilities - Filtering and scoring functions
 *
 * These utilities provide the default filtering behavior for the command palette,
 * matching cmdk's behavior while allowing custom filter overrides.
 */

import * as React from 'react';

/**
 * Filter function signature matching cmdk API.
 * Returns a score between 0 and 1, where 0 means no match.
 */
export type CommandFilterFn = (
  value: string,
  search: string,
  keywords?: string[]
) => number;

const WHITESPACE_WITH_LINE_BREAKS = /[\n\r\t]/;

/**
 * Filter out whitespace-only children created by JSX formatting.
 *
 * Keeps explicit spaces (e.g. {' '}) but removes newline/tab-only nodes
 * that React Native cannot render inside View components.
 */
export function filterWhitespaceChildren(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).filter((child) => {
    if (typeof child !== 'string') {
      return true;
    }

    if (child.trim() !== '') {
      return true;
    }

    return !WHITESPACE_WITH_LINE_BREAKS.test(child);
  });
}

/**
 * Score constants for different match types.
 * These values are used by the default filter for consistent scoring.
 */
export const SCORE: Record<string, number> = {
  /** Perfect match - value equals search exactly */
  EXACT: 1.0,
  /** Value starts with the search term */
  STARTS_WITH: 0.9,
  /** Value contains the search term */
  CONTAINS: 0.7,
  /** Characters appear in order (fuzzy match) */
  FUZZY: 0.5,
  /** No match */
  NO_MATCH: 0,
};

/**
 * Normalize a string for comparison.
 * Trims whitespace and converts to lowercase (cmdk behavior).
 */
export function normalizeString(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Check if all characters of needle appear in haystack in order.
 * This provides a simple fuzzy match.
 */
export function fuzzyMatch(haystack: string, needle: string): boolean {
  let needleIdx = 0;

  for (let i = 0; i < haystack.length && needleIdx < needle.length; i++) {
    if (haystack[i] === needle[needleIdx]) {
      needleIdx++;
    }
  }

  return needleIdx === needle.length;
}

/**
 * Score a single string against a search term.
 */
export function scoreString(hay: string, needle: string): number {
  // Exact match
  if (hay === needle) {
    return SCORE.EXACT;
  }

  // Starts with
  if (hay.startsWith(needle)) {
    return SCORE.STARTS_WITH;
  }

  // Contains
  if (hay.includes(needle)) {
    return SCORE.CONTAINS;
  }

  // Fuzzy match
  if (fuzzyMatch(hay, needle)) {
    return SCORE.FUZZY;
  }

  return SCORE.NO_MATCH;
}

/**
 * Default filter function for command items.
 *
 * @param value - The item's value to match against
 * @param search - The search query
 * @param keywords - Optional additional keywords to match
 * @returns Score between 0 and 1
 *
 * @remarks
 * - Empty search matches everything with score 1
 * - Matches against value first, then keywords
 * - Returns the highest score found across all candidates
 * - Applies trim() to all inputs before scoring (cmdk behavior)
 */
export function commandScore(
  value: string,
  search: string,
  keywords: string[] = []
): number {
  const normalizedSearch = normalizeString(search);
  const normalizedValue = normalizeString(value);

  // Empty search matches everything
  if (!normalizedSearch) {
    return SCORE.EXACT;
  }

  // Build list of candidates to match against
  const candidates = [
    normalizedValue,
    ...keywords.map((k) => normalizeString(k)),
  ];

  // Find best score across all candidates
  let bestScore = SCORE.NO_MATCH;

  for (const candidate of candidates) {
    const score = scoreString(candidate, normalizedSearch);
    if (score > bestScore) {
      bestScore = score;
    }

    // Early exit on exact match
    if (bestScore === SCORE.EXACT) {
      break;
    }
  }

  return bestScore;
}

/**
 * Generate a unique ID for command items/groups.
 * Uses crypto.randomUUID when available, falls back to simple counter.
 */
let idCounter = 0;

export function generateId(prefix: string = 'cmd'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if an item should be visible based on filter state.
 */
export function shouldShowItem(
  itemId: string,
  filteredItems: Map<string, number>,
  forceMount?: boolean
): boolean {
  if (forceMount) return true;
  return filteredItems.has(itemId);
}

/**
 * Check if a group should be visible based on filter state.
 */
export function shouldShowGroup(
  groupId: string,
  filteredGroups: Set<string>,
  forceMount?: boolean
): boolean {
  if (forceMount) return true;
  return filteredGroups.has(groupId);
}

/**
 * Get the score for an item. Returns 0 if not in filtered map.
 */
export function getItemScore(
  itemId: string,
  filteredItems: Map<string, number>
): number {
  return filteredItems.get(itemId) ?? 0;
}
