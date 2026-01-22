/**
 * Command Context - React context providers and hooks
 *
 * Provides access to the command store and state for child components.
 * Follows the pattern used in sidebar-context.tsx.
 */

import * as React from 'react';
import { useSyncExternalStore } from 'react';
import type { CommandState, CommandStore } from './command-store';

// Main context for the command store
const CommandContext = React.createContext<CommandStore | null>(null);
CommandContext.displayName = 'CommandContext';

// Context for shared IDs (listbox, etc.)
type CommandIdContextValue = {
  listId: string;
};

const CommandIdContext = React.createContext<CommandIdContextValue | null>(null);
CommandIdContext.displayName = 'CommandIdContext';

// Context for group information (passed to items within groups)
type CommandGroupContextValue = {
  id: string;
  forceMount?: boolean;
};

const CommandGroupContext = React.createContext<CommandGroupContextValue | null>(null);
CommandGroupContext.displayName = 'CommandGroupContext';

// Context for tracking loading state
type CommandLoadingContextValue = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const CommandLoadingContext = React.createContext<CommandLoadingContextValue | null>(null);
CommandLoadingContext.displayName = 'CommandLoadingContext';

/**
 * Hook to access the command store.
 * Must be used within a Command component.
 *
 * @throws Error if used outside of Command
 */
export function useCommand(): CommandStore {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error('useCommand must be used within a Command component.');
  }
  return context;
}

/**
 * Hook to access reactive command state using useSyncExternalStore.
 * Re-renders when state changes.
 *
 * @throws Error if used outside of Command
 */
export function useCommandState(): CommandState;
export function useCommandState<T>(selector: (state: CommandState) => T): T;
export function useCommandState<T>(
  selector?: (state: CommandState) => T
): CommandState | T {
  const store = useCommand();

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState // Server snapshot (same as client for this use case)
  );

  return selector ? selector(state) : state;
}

/**
 * Hook to get just the search value.
 */
export function useCommandSearch(): string {
  return useCommandState((state) => state.search);
}

/**
 * Hook to get just the selected value.
 */
export function useCommandValue(): string {
  return useCommandState((state) => state.value);
}

/**
 * Hook to get the filtered count.
 */
export function useCommandFilteredCount(): number {
  return useCommandState((state) => state.filtered.count);
}

/**
 * Hook to check if an item is currently selected.
 */
export function useCommandItemSelected(value: string): boolean {
  return useCommandState((state) => state.value === value);
}

/**
 * Hook to check if an item is visible (not filtered out).
 */
export function useCommandItemVisible(itemId: string): boolean {
  return useCommandState((state) => state.filtered.items.has(itemId));
}

/**
 * Hook to get an item's filter score.
 */
export function useCommandItemScore(itemId: string): number {
  return useCommandState((state) => state.filtered.items.get(itemId) ?? 0);
}

/**
 * Hook to check if a group has any visible items.
 */
export function useCommandGroupVisible(groupId: string): boolean {
  return useCommandState((state) => state.filtered.groups.has(groupId));
}

/**
 * Hook to access group context.
 * Returns null if not within a CommandGroup.
 */
export function useCommandGroup(): CommandGroupContextValue | null {
  return React.useContext(CommandGroupContext);
}

/**
 * Hook to access loading context.
 */
export function useCommandLoading(): CommandLoadingContextValue {
  const context = React.useContext(CommandLoadingContext);
  if (!context) {
    throw new Error('useCommandLoading must be used within a Command component.');
  }
  return context;
}

/**
 * Hook to access shared command IDs (listbox, etc.).
 */
export function useCommandListId(): string {
  const context = React.useContext(CommandIdContext);
  if (!context) {
    throw new Error('useCommandListId must be used within a Command component.');
  }
  return context.listId;
}

// Provider component types
type CommandProviderProps = {
  store: CommandStore;
  listId: string;
  children: React.ReactNode;
};

/**
 * Internal provider component for the command store.
 */
function CommandProvider({ store, listId, children }: CommandProviderProps) {
  // Loading state managed at the root level
  const [loading, setLoading] = React.useState(false);

  const loadingValue = React.useMemo(
    () => ({ loading, setLoading }),
    [loading]
  );

  const idValue = React.useMemo(
    () => ({ listId }),
    [listId]
  );

  return (
    <CommandContext.Provider value={store}>
      <CommandIdContext.Provider value={idValue}>
        <CommandLoadingContext.Provider value={loadingValue}>
          {children}
        </CommandLoadingContext.Provider>
      </CommandIdContext.Provider>
    </CommandContext.Provider>
  );
}

type CommandGroupProviderProps = {
  id: string;
  forceMount?: boolean;
  children: React.ReactNode;
};

/**
 * Internal provider component for group context.
 */
function CommandGroupProvider({ id, forceMount, children }: CommandGroupProviderProps) {
  const value = React.useMemo(() => ({ id, forceMount }), [id, forceMount]);

  return (
    <CommandGroupContext.Provider value={value}>
      {children}
    </CommandGroupContext.Provider>
  );
}

export {
  CommandContext,
  CommandIdContext,
  CommandGroupContext,
  CommandGroupProvider,
  CommandLoadingContext,
  CommandProvider,
};

export type {
  CommandIdContextValue,
  CommandGroupContextValue,
  CommandGroupProviderProps,
  CommandLoadingContextValue,
  CommandProviderProps,
};
