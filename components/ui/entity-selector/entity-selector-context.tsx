/**
 * EntitySelector Context - React context providers and hooks for EntitySelector state
 *
 * Provides shared state between all EntitySelector components, including:
 * - Selection state (multi-select with pool tracking)
 * - Tab/pool state
 * - Search state
 * - Config access
 *
 * Note: Highlight state is in a separate context (entity-selector-highlight-context.tsx)
 * to prevent re-renders on keyboard navigation.
 */

import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import type { TextInput } from 'react-native';
import {
  useEntitySelectorHighlight,
  useEntitySelectorHighlightedId as useHighlightedIdFromContext,
  useEntitySelectorIsHighlighted as useIsHighlightedFromContext,
} from './entity-selector-highlight-context';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Avatar configuration for an entity item
 */
export type EntityAvatarConfig = {
  /** Image source URL */
  src?: string;
  /** Fallback text (e.g., initials) */
  fallback?: string;
  /** Fallback icon component */
  icon?: LucideIcon;
  /** Background color for fallback */
  color?: string;
};

/**
 * Entity item configuration - represents a selectable entity
 */
export type EntityItemConfig = {
  /** Unique identifier for this entity */
  id: string;
  /** Display title */
  title: string;
  /** Optional description/subtitle */
  description?: string;
  /** Avatar configuration */
  avatar?: EntityAvatarConfig;
  /** Additional search terms for filtering */
  keywords?: string[];
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Custom payload data for actions */
  data?: Record<string, unknown>;
};

/**
 * Badge configuration for pool items
 */
export type EntityBadgeConfig = {
  /** Badge label text (e.g., "Profile", "Team") */
  label: string;
};

/**
 * Pool configuration - each pool represents a tab/category of entities
 */
export type EntityPoolConfig = {
  /** Unique identifier for this pool */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Optional icon for the tab */
  icon?: LucideIcon;
  /** Items in this pool */
  items: EntityItemConfig[];
  /** Badge config for items in this pool (shown in selected section) */
  itemBadge?: EntityBadgeConfig;
};

/**
 * Full selector configuration
 */
export type EntitySelectorConfig = {
  /** Available pools (each pool = a tab) */
  pools: EntityPoolConfig[];
  /** Default active pool ID */
  defaultPool?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Message shown when no results match search */
  emptyMessage?: string;
  /** Maximum number of selections allowed */
  maxSelections?: number;
};

/**
 * Selection tracking - includes pool origin for context
 */
export type EntitySelection = {
  /** Entity ID */
  id: string;
  /** Pool ID where this entity was selected from */
  poolId: string;
  /** The full entity config */
  entity: EntityItemConfig;
};

// ============================================================================
// Context Types
// ============================================================================

/**
 * Navigable item for keyboard navigation
 */
export type EntityNavigableItem = {
  id: string;
  disabled?: boolean;
  entity: EntityItemConfig;
  poolId: string;
};

/**
 * Context value type containing all EntitySelector state and callbacks
 *
 * Note: highlightedId and setHighlightedId are now in a separate highlight context
 * to prevent re-renders on keyboard navigation. Access via useEntitySelectorHighlight().
 */
export type EntitySelectorContextValue = {
  // Config
  config: EntitySelectorConfig;

  // Selection state
  selections: EntitySelection[];
  toggleSelection: (entity: EntityItemConfig, poolId: string) => void;
  isSelected: (entityId: string) => boolean;
  clearSelections: () => void;

  // Tab/Pool state
  activePool: string;
  setActivePool: (poolId: string) => void;

  // Search state
  search: string;
  setSearch: (search: string) => void;

  // Open state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Haptics
  haptics: boolean;

  // Pool helpers
  getPool: (poolId: string) => EntityPoolConfig | undefined;
  getPoolBadge: (poolId: string) => EntityBadgeConfig | undefined;
  getFilteredItems: (poolId: string) => EntityItemConfig[];

  // Keyboard navigation
  getNavigableItems: () => EntityNavigableItem[];

  // Focus management
  inputRef: React.RefObject<TextInput | null>;
  focusInput: () => void;
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Validates that an entity item has required fields
 */
function isValidEntity(item: EntityItemConfig): boolean {
  if (!item?.id || !item?.title) {
    if (__DEV__) {
      console.warn('EntitySelector: Item missing required fields (id, title)', item);
    }
    return false;
  }
  return true;
}

/**
 * Filters entity items based on search query
 */
export function filterEntityItems(items: EntityItemConfig[], search: string): EntityItemConfig[] {
  if (!search.trim()) return items.filter(isValidEntity);

  const query = search.toLowerCase().trim();

  return items.filter((item) => {
    if (!isValidEntity(item)) return false;
    if (item.title.toLowerCase().includes(query)) return true;
    if (item.description?.toLowerCase().includes(query)) return true;
    if (item.keywords?.some((kw) => kw.toLowerCase().includes(query))) return true;
    if (item.id.toLowerCase().includes(query)) return true;
    return false;
  });
}

// ============================================================================
// Context
// ============================================================================

const EntitySelectorContext = React.createContext<EntitySelectorContextValue | null>(null);
EntitySelectorContext.displayName = 'EntitySelectorContext';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access the full EntitySelector context.
 * Must be used within an EntitySelector component.
 *
 * @throws Error if used outside of EntitySelector
 */
export function useEntitySelector(): EntitySelectorContextValue {
  const context = React.useContext(EntitySelectorContext);
  if (!context) {
    throw new Error('useEntitySelector must be used within an EntitySelector component.');
  }
  return context;
}

/**
 * Hook to check if an entity is currently selected.
 */
export function useEntitySelectorSelected(entityId: string): boolean {
  const context = useEntitySelector();
  return context.isSelected(entityId);
}

/**
 * Hook to get the current selections.
 */
export function useEntitySelectorSelections(): EntitySelection[] {
  const context = useEntitySelector();
  return context.selections;
}

/**
 * Hook to get the active pool ID.
 */
export function useEntitySelectorActivePool(): string {
  const context = useEntitySelector();
  return context.activePool;
}

/**
 * Hook to get the current search value.
 */
export function useEntitySelectorSearch(): string {
  const context = useEntitySelector();
  return context.search;
}

/**
 * Hook to get the open state.
 */
export function useEntitySelectorOpen(): boolean {
  const context = useEntitySelector();
  return context.open;
}

/**
 * Hook to get the highlighted item ID.
 * Re-exported from highlight context for backwards compatibility.
 */
export function useEntitySelectorHighlightedId(): string | null {
  return useHighlightedIdFromContext();
}

/**
 * Hook to check if an entity is currently highlighted.
 * Re-exported from highlight context for backwards compatibility.
 */
export function useEntitySelectorIsHighlighted(entityId: string): boolean {
  return useIsHighlightedFromContext(entityId);
}

// Re-export highlight context hook for direct access
export { useEntitySelectorHighlight };

// ============================================================================
// Provider
// ============================================================================

type EntitySelectorProviderProps = {
  value: EntitySelectorContextValue;
  children: React.ReactNode;
};

/**
 * Internal provider component for the EntitySelector context.
 */
function EntitySelectorProvider({ value, children }: EntitySelectorProviderProps) {
  return (
    <EntitySelectorContext.Provider value={value}>
      {children}
    </EntitySelectorContext.Provider>
  );
}

export { EntitySelectorContext, EntitySelectorProvider };
export type { EntitySelectorProviderProps };
