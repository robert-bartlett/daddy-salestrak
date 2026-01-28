/**
 * EntitySelector Selected - Displays currently selected items
 *
 * Shows the selected entities with their pool badges.
 * Can be hidden when empty.
 */

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { useEntitySelector } from './entity-selector-context';
import { EntitySelectorItem } from './entity-selector-item';

export type EntitySelectorSelectedProps = {
  /** Section label */
  label?: string;
  /** Hide the section when no items are selected */
  hideWhenEmpty?: boolean;
  /** Custom render function for items */
  children?: React.ReactNode;
};

/**
 * EntitySelectorSelected - Displays the currently selected items.
 *
 * @remarks
 * - Shows each selected item with its pool badge
 * - Can be hidden when empty
 * - Items can be removed by clicking them
 *
 * @example
 * ```tsx
 * <EntitySelectorSelected label="Assignees" hideWhenEmpty />
 * ```
 */
const EntitySelectorSelected = React.forwardRef<View, EntitySelectorSelectedProps>(
  ({ label = 'Selected', hideWhenEmpty = false, children }, ref) => {
    const { selections, getPoolBadge } = useEntitySelector();

    // Hide if empty and hideWhenEmpty is true
    if (hideWhenEmpty && selections.length === 0) {
      return null;
    }

    // Allow custom children rendering
    if (children) {
      return (
        <View ref={ref} className="border-b border-border">
          {children}
        </View>
      );
    }

    return (
      <View ref={ref} className="border-b border-border">
        {/* Section header */}
        <View className="flex flex-row items-center gap-2 px-3 py-2">
          <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
          {selections.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5">
              <Text className="text-xs">{selections.length}</Text>
            </Badge>
          )}
        </View>

        {/* Selected items list */}
        {selections.length > 0 ? (
          <View className="px-1 pb-1">
            {selections.map((selection) => {
              const badge = getPoolBadge(selection.poolId);
              return (
                <EntitySelectorItem
                  key={selection.id}
                  entity={selection.entity}
                  poolId={selection.poolId}
                  actionLabel={badge?.label}
                  showCheckbox
                />
              );
            })}
          </View>
        ) : (
          <View className="px-3 pb-3">
            <Text className="text-sm text-muted-foreground">No items selected</Text>
          </View>
        )}
      </View>
    );
  }
);

EntitySelectorSelected.displayName = 'EntitySelectorSelected';

export { EntitySelectorSelected };
