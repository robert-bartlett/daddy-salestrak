/**
 * Tests for command-utils.ts
 *
 * Tests the utility functions for filtering and scoring.
 */

import {
  commandScore,
  fuzzyMatch,
  generateId,
  getItemScore,
  normalizeString,
  scoreString,
  shouldShowGroup,
  shouldShowItem,
  SCORE,
} from '../command-utils';

describe('normalizeString', () => {
  it('trims whitespace', () => {
    expect(normalizeString('  hello  ')).toBe('hello');
    expect(normalizeString('\t\nhello\t\n')).toBe('hello');
  });

  it('converts to lowercase', () => {
    expect(normalizeString('HELLO')).toBe('hello');
    expect(normalizeString('HeLLo WoRLD')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(normalizeString('')).toBe('');
    expect(normalizeString('   ')).toBe('');
  });
});

describe('fuzzyMatch', () => {
  it('returns true when all chars appear in order', () => {
    expect(fuzzyMatch('typescript', 'tsc')).toBe(true);
    expect(fuzzyMatch('hello world', 'hwd')).toBe(true);
    expect(fuzzyMatch('abc', 'abc')).toBe(true);
  });

  it('returns false when chars do not appear in order', () => {
    expect(fuzzyMatch('typescript', 'cst')).toBe(false);
    expect(fuzzyMatch('hello', 'leh')).toBe(false);
  });

  it('handles empty needle', () => {
    expect(fuzzyMatch('anything', '')).toBe(true);
  });

  it('handles empty haystack', () => {
    expect(fuzzyMatch('', 'x')).toBe(false);
    expect(fuzzyMatch('', '')).toBe(true);
  });
});

describe('scoreString', () => {
  it('returns EXACT for identical strings', () => {
    expect(scoreString('test', 'test')).toBe(SCORE.EXACT);
  });

  it('returns STARTS_WITH for prefix matches', () => {
    expect(scoreString('testing', 'test')).toBe(SCORE.STARTS_WITH);
  });

  it('returns CONTAINS for substring matches', () => {
    expect(scoreString('my test value', 'test')).toBe(SCORE.CONTAINS);
  });

  it('returns FUZZY for fuzzy matches', () => {
    expect(scoreString('typescript', 'tsc')).toBe(SCORE.FUZZY);
  });

  it('returns NO_MATCH for no match', () => {
    expect(scoreString('hello', 'xyz')).toBe(SCORE.NO_MATCH);
  });
});

describe('commandScore', () => {
  it('returns EXACT for empty search', () => {
    expect(commandScore('anything', '')).toBe(SCORE.EXACT);
    expect(commandScore('anything', '   ')).toBe(SCORE.EXACT);
  });

  it('scores value matches', () => {
    expect(commandScore('test', 'test')).toBe(SCORE.EXACT);
    expect(commandScore('testing', 'test')).toBe(SCORE.STARTS_WITH);
    expect(commandScore('my test', 'test')).toBe(SCORE.CONTAINS);
  });

  it('scores keyword matches', () => {
    expect(commandScore('settings', 'pref', ['preferences'])).toBeGreaterThan(0);
    expect(commandScore('settings', 'preferences', ['preferences'])).toBe(SCORE.EXACT);
  });

  it('returns best score from value and keywords', () => {
    // Value is "ab", keyword is "abc" - searching for "abc" should match keyword exactly
    expect(commandScore('ab', 'abc', ['abc'])).toBe(SCORE.EXACT);
  });

  it('trims and normalizes inputs', () => {
    expect(commandScore('  TEST  ', '  test  ')).toBe(SCORE.EXACT);
    expect(commandScore('test', 'TEST', ['  keyword  '])).toBe(SCORE.EXACT);
  });
});

describe('generateId', () => {
  it('generates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('uses default prefix', () => {
    const id = generateId();
    expect(id.startsWith('cmd-')).toBe(true);
  });

  it('uses custom prefix', () => {
    const id = generateId('item');
    expect(id.startsWith('item-')).toBe(true);
  });
});

describe('shouldShowItem', () => {
  it('returns true when item is in filtered map', () => {
    const filtered = new Map([['item-1', 1]]);
    expect(shouldShowItem('item-1', filtered)).toBe(true);
  });

  it('returns false when item is not in filtered map', () => {
    const filtered = new Map([['item-1', 1]]);
    expect(shouldShowItem('item-2', filtered)).toBe(false);
  });

  it('returns true when forceMount is true', () => {
    const filtered = new Map();
    expect(shouldShowItem('item-1', filtered, true)).toBe(true);
  });
});

describe('shouldShowGroup', () => {
  it('returns true when group is in filtered set', () => {
    const filtered = new Set(['group-1']);
    expect(shouldShowGroup('group-1', filtered)).toBe(true);
  });

  it('returns false when group is not in filtered set', () => {
    const filtered = new Set(['group-1']);
    expect(shouldShowGroup('group-2', filtered)).toBe(false);
  });

  it('returns true when forceMount is true', () => {
    const filtered = new Set<string>();
    expect(shouldShowGroup('group-1', filtered, true)).toBe(true);
  });
});

describe('getItemScore', () => {
  it('returns score when item exists', () => {
    const filtered = new Map([['item-1', 0.75]]);
    expect(getItemScore('item-1', filtered)).toBe(0.75);
  });

  it('returns 0 when item does not exist', () => {
    const filtered = new Map([['item-1', 0.75]]);
    expect(getItemScore('item-2', filtered)).toBe(0);
  });
});

describe('SCORE constants', () => {
  it('has correct values', () => {
    expect(SCORE.EXACT).toBe(1.0);
    expect(SCORE.STARTS_WITH).toBe(0.9);
    expect(SCORE.CONTAINS).toBe(0.7);
    expect(SCORE.FUZZY).toBe(0.5);
    expect(SCORE.NO_MATCH).toBe(0);
  });

  it('has descending order', () => {
    expect(SCORE.EXACT).toBeGreaterThan(SCORE.STARTS_WITH);
    expect(SCORE.STARTS_WITH).toBeGreaterThan(SCORE.CONTAINS);
    expect(SCORE.CONTAINS).toBeGreaterThan(SCORE.FUZZY);
    expect(SCORE.FUZZY).toBeGreaterThan(SCORE.NO_MATCH);
  });
});
