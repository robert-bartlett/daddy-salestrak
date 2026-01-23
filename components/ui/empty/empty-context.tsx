/**
 * Empty Context - React context provider and hooks for Empty state
 *
 * Provides shared size state between all Empty subcomponents.
 */

import * as React from 'react';

export type EmptySize = 'sm' | 'md' | 'lg';

export type EmptyContextValue = {
  size: EmptySize;
};

const EmptyContext = React.createContext<EmptyContextValue | null>(null);
EmptyContext.displayName = 'EmptyContext';

/**
 * Hook to access the full empty context.
 * Must be used within an Empty component.
 *
 * @throws Error if used outside of Empty
 */
export function useEmpty(): EmptyContextValue {
  const context = React.useContext(EmptyContext);
  if (!context) {
    throw new Error('useEmpty must be used within an Empty component.');
  }
  return context;
}

/**
 * Convenience hook to access just the size value.
 */
export function useEmptySize(): EmptySize {
  return useEmpty().size;
}

type EmptyProviderProps = {
  value: EmptyContextValue;
  children: React.ReactNode;
};

/**
 * Internal provider component for the empty context.
 */
function EmptyProvider({ value, children }: EmptyProviderProps) {
  return (
    <EmptyContext.Provider value={value}>{children}</EmptyContext.Provider>
  );
}

export { EmptyContext, EmptyProvider };
export type { EmptyProviderProps };
