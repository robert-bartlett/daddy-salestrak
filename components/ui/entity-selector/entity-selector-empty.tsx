/**
 * EntitySelector Empty - Empty/no results state
 *
 * Shown when no items match the search query in the active pool.
 */

import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { useEntitySelector } from './entity-selector-context';

export type EntitySelectorEmptyProps = {
  /** Custom content */
  children?: React.ReactNode;
};

/**
 * EntitySelectorEmpty - Shows when no items match the search.
 *
 * @remarks
 * - Only visible when search is active and no results found
 * - Uses config.emptyMessage if no children provided
 *
 * @example
 * ```tsx
 * <EntitySelectorEmpty>No members found</EntitySelectorEmpty>
 * ```
 */
const EntitySelectorEmpty = React.forwardRef<View, EntitySelectorEmptyProps>(
  ({ children }, ref) => {
    const { search, activePool, getFilteredItems, config } = useEntitySelector();

    // Use cached filtered items from context
    const filteredItems = getFilteredItems(activePool);

    // Check if any items match the search
    const hasResults = !search.trim() || filteredItems.length > 0;

    // Don't show if there are results
    if (hasResults) {
      return null;
    }

    const message = children ?? config.emptyMessage ?? 'No results found';

    return (
      <View ref={ref} className="py-6 text-center">
        <Text className="text-sm text-muted-foreground">{message}</Text>
      </View>
    );
  }
);

EntitySelectorEmpty.displayName = 'EntitySelectorEmpty';

export { EntitySelectorEmpty };
