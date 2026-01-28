/**
 * EntitySelector Highlight Context - Separate context for keyboard highlight state
 *
 * This context is separated from the main EntitySelector context to prevent
 * re-renders of all consumers when only the highlighted item changes during
 * keyboard navigation.
 */

import * as React from 'react';

// ============================================================================
// Context Types
// ============================================================================

export type EntitySelectorHighlightContextValue = {
  highlightedId: string | null;
  setHighlightedId: (id: string | null) => void;
};

// ============================================================================
// Context
// ============================================================================

const EntitySelectorHighlightContext =
  React.createContext<EntitySelectorHighlightContextValue | null>(null);
EntitySelectorHighlightContext.displayName = 'EntitySelectorHighlightContext';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access the highlight context.
 * Must be used within an EntitySelector component.
 *
 * @throws Error if used outside of EntitySelector
 */
export function useEntitySelectorHighlight(): EntitySelectorHighlightContextValue {
  const context = React.useContext(EntitySelectorHighlightContext);
  if (!context) {
    throw new Error(
      'useEntitySelectorHighlight must be used within an EntitySelector component.'
    );
  }
  return context;
}

/**
 * Hook to get the highlighted item ID.
 */
export function useEntitySelectorHighlightedId(): string | null {
  const context = useEntitySelectorHighlight();
  return context.highlightedId;
}

/**
 * Hook to check if an entity is currently highlighted.
 * Only re-renders when this specific entity's highlight status changes.
 */
export function useEntitySelectorIsHighlighted(entityId: string): boolean {
  const { highlightedId } = useEntitySelectorHighlight();
  return highlightedId === entityId;
}

// ============================================================================
// Provider
// ============================================================================

type EntitySelectorHighlightProviderProps = {
  children: React.ReactNode;
};

/**
 * Internal provider component for the highlight context.
 * Manages highlight state independently from the main context.
 */
function EntitySelectorHighlightProvider({
  children,
}: EntitySelectorHighlightProviderProps) {
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

  const value = React.useMemo(
    () => ({
      highlightedId,
      setHighlightedId,
    }),
    [highlightedId]
  );

  return (
    <EntitySelectorHighlightContext.Provider value={value}>
      {children}
    </EntitySelectorHighlightContext.Provider>
  );
}

export {
  EntitySelectorHighlightContext,
  EntitySelectorHighlightProvider,
};
