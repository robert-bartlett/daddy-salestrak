/**
 * EntitySelector Tabs - Tab components for pool switching
 *
 * Thin wrappers around existing Tabs with context integration.
 * Syncs with EntitySelector's activePool state.
 */

import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { useEntitySelector } from './entity-selector-context';

// ============================================================================
// EntitySelectorTabs (Root)
// ============================================================================

export type EntitySelectorTabsProps = {
  /** Children (EntitySelectorTabsList) */
  children: React.ReactNode;
};

/**
 * EntitySelectorTabs - Container for tab navigation.
 *
 * @remarks
 * - Syncs with context's activePool state
 * - Wraps the standard Tabs component
 *
 * @example
 * ```tsx
 * <EntitySelectorTabs>
 *   <EntitySelectorTabsList>
 *     <EntitySelectorTabsTrigger value="members">Members</EntitySelectorTabsTrigger>
 *     <EntitySelectorTabsTrigger value="teams">Teams</EntitySelectorTabsTrigger>
 *   </EntitySelectorTabsList>
 * </EntitySelectorTabs>
 * ```
 */
const EntitySelectorTabs = React.forwardRef<React.ComponentRef<typeof Tabs>, EntitySelectorTabsProps>(
  ({ children }, ref) => {
    const { activePool, setActivePool } = useEntitySelector();

    return (
      <Tabs ref={ref} value={activePool} onValueChange={setActivePool} className="px-3 py-2">
        {children}
      </Tabs>
    );
  }
);

EntitySelectorTabs.displayName = 'EntitySelectorTabs';

// ============================================================================
// EntitySelectorTabsList
// ============================================================================

export type EntitySelectorTabsListProps = {
  /** Children (EntitySelectorTabsTrigger components) */
  children: React.ReactNode;
};

/**
 * EntitySelectorTabsList - Container for tab triggers.
 */
const EntitySelectorTabsList = React.forwardRef<
  React.ComponentRef<typeof TabsList>,
  EntitySelectorTabsListProps
>(({ children }, ref) => {
  return (
    <TabsList ref={ref} variant="outline">
      {children}
    </TabsList>
  );
});

EntitySelectorTabsList.displayName = 'EntitySelectorTabsList';

// ============================================================================
// EntitySelectorTabsTrigger
// ============================================================================

export type EntitySelectorTabsTriggerProps = {
  /** Pool ID this tab represents */
  value: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Children (label content) */
  children?: React.ReactNode;
};

/**
 * EntitySelectorTabsTrigger - Individual tab button.
 *
 * @remarks
 * - Can show an icon before the label
 * - Auto-generates label from pool config if no children provided
 */
const EntitySelectorTabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsTrigger>,
  EntitySelectorTabsTriggerProps
>(({ value, icon, children }, ref) => {
  const { getPool } = useEntitySelector();
  const pool = getPool(value);

  // Use pool's icon if not explicitly provided
  const IconComponent = icon ?? pool?.icon;

  // Use pool's label if no children provided
  const label = children ?? pool?.label ?? value;

  return (
    <TabsTrigger ref={ref} value={value}>
      {IconComponent && <Icon as={IconComponent} size={16} />}
      {label}
    </TabsTrigger>
  );
});

EntitySelectorTabsTrigger.displayName = 'EntitySelectorTabsTrigger';

// ============================================================================
// Auto-generated Tabs from Config
// ============================================================================

export type EntitySelectorAutoTabsProps = Record<string, never>;

/**
 * EntitySelectorAutoTabs - Automatically generates tabs from config.
 *
 * @remarks
 * - Convenience component that reads pools from config
 * - Creates a tab for each pool
 *
 * @example
 * ```tsx
 * <EntitySelectorAutoTabs />
 * ```
 */
const EntitySelectorAutoTabs = React.forwardRef<
  React.ComponentRef<typeof EntitySelectorTabs>,
  EntitySelectorAutoTabsProps
>((_props, ref) => {
  const { config } = useEntitySelector();

  return (
    <EntitySelectorTabs ref={ref}>
      <EntitySelectorTabsList>
        {config.pools.map((pool) => (
          <EntitySelectorTabsTrigger key={pool.id} value={pool.id} icon={pool.icon}>
            {pool.label}
          </EntitySelectorTabsTrigger>
        ))}
      </EntitySelectorTabsList>
    </EntitySelectorTabs>
  );
});

EntitySelectorAutoTabs.displayName = 'EntitySelectorAutoTabs';

export {
  EntitySelectorTabs,
  EntitySelectorTabsList,
  EntitySelectorTabsTrigger,
  EntitySelectorAutoTabs,
};
