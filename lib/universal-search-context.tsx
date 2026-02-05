/**
 * Universal Search Context - Global state for command palette
 *
 * Manages the state for the universal search / command palette including:
 * - Open/close state
 * - Search query
 * - Drill-down navigation (Workflows → Stages → Projects)
 * - Recent searches (persisted via AsyncStorage)
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export type DrillDownLevel =
  | { type: 'workflow'; id: string; title: string }
  | { type: 'stage'; id: string; workflowId: string; title: string }
  | { type: 'activity'; title: string }
  | { type: 'workflows'; title: string };

type UniversalSearchContextValue = {
  /** Whether the command palette is open */
  isOpen: boolean;
  /** Open the command palette */
  open: () => void;
  /** Close the command palette */
  close: () => void;
  /** Toggle the command palette */
  toggle: () => void;

  /** Current search query */
  query: string;
  /** Set the search query */
  setQuery: (q: string) => void;

  /** Drill-down navigation stack */
  drillStack: DrillDownLevel[];
  /** Drill into a workflow or stage */
  drillInto: (level: DrillDownLevel) => void;
  /** Go back one level */
  drillBack: () => void;
  /** Clear the drill stack (return to top level) */
  clearDrill: () => void;

  /** Recent searches (persisted) */
  recentSearches: string[];
  /** Add a search to recent searches */
  addRecentSearch: (q: string) => void;
  /** Clear all recent searches */
  clearRecentSearches: () => void;
};

// ============================================================================
// Context
// ============================================================================

const UniversalSearchContext = createContext<UniversalSearchContextValue | null>(null);

const RECENT_SEARCHES_KEY = '@universal_search_recent';
const MAX_RECENT_SEARCHES = 10;

// ============================================================================
// Provider
// ============================================================================

export function UniversalSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [drillStack, setDrillStack] = useState<DrillDownLevel[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
          }
        } catch {
          // Ignore parse errors
        }
      }
    });
  }, []);

  // Persist recent searches when they change
  useEffect(() => {
    AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Open/close handlers
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Reset state after close animation
    setTimeout(() => {
      setQuery('');
      setDrillStack([]);
    }, 300);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Drill-down handlers
  const drillInto = useCallback((level: DrillDownLevel) => {
    setDrillStack((prev) => [...prev, level]);
    setQuery(''); // Clear query when drilling
  }, []);

  const drillBack = useCallback(() => {
    setDrillStack((prev) => prev.slice(0, -1));
    setQuery(''); // Clear query when going back
  }, []);

  const clearDrill = useCallback(() => {
    setDrillStack([]);
    setQuery('');
  }, []);

  // Recent searches handlers
  const addRecentSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // Remove if already exists (will be added to front)
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      // Add to front and limit
      return [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  // Memoize context value
  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      query,
      setQuery,
      drillStack,
      drillInto,
      drillBack,
      clearDrill,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      query,
      setQuery,
      drillStack,
      drillInto,
      drillBack,
      clearDrill,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
    ]
  );

  return (
    <UniversalSearchContext.Provider value={value}>
      {children}
    </UniversalSearchContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useUniversalSearch() {
  const context = useContext(UniversalSearchContext);
  if (!context) {
    throw new Error('useUniversalSearch must be used within a UniversalSearchProvider');
  }
  return context;
}
