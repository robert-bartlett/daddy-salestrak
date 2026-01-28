/**
 * EntitySelector Pool - Renders items for a specific pool/tab
 *
 * Only visible when the pool's tab is active.
 * Handles filtering based on search query.
 * Uses FlatList for virtualization when item count exceeds threshold.
 */

import { Text } from '@/components/ui/text';
import * as React from 'react';
import { FlatList, type ListRenderItemInfo, Platform, View } from 'react-native';
import {
  useEntitySelector,
  useEntitySelectorHighlight,
  type EntityItemConfig,
} from './entity-selector-context';
import { EntitySelectorItem } from './entity-selector-item';

// Threshold for switching from .map() to FlatList
const VIRTUALIZE_THRESHOLD = 50;

// Fixed item height for getItemLayout optimization
const ITEM_HEIGHT = 44;

export type EntitySelectorPoolProps = {
  /** Pool ID to display items for */
  value: string;
  /** Optional section label/heading */
  label?: string;
  /** Callback when action button is pressed on an item */
  onItemAction?: (entity: EntityItemConfig) => void;
};

/**
 * EntitySelectorPool - Displays items for a specific pool.
 *
 * @remarks
 * - Only renders when its tab is active
 * - Filters items based on search query
 * - Shows section label if provided
 *
 * @example
 * ```tsx
 * <EntitySelectorPool value="members" label="Members" />
 * <EntitySelectorPool value="teams" label="Teams" />
 * ```
 */
function EntitySelectorPool({ value, label, onItemAction }: EntitySelectorPoolProps) {
  const { activePool, getPool, getPoolBadge, getFilteredItems } = useEntitySelector();
  const { highlightedId } = useEntitySelectorHighlight();

  const pool = getPool(value);
  const badge = getPoolBadge(value);
  const filteredItems = getFilteredItems(value);
  const sectionLabel = label ?? pool?.label;
  const isActive = activePool === value;

  // Ref for FlatList to enable scrollToIndex
  const flatListRef = React.useRef<FlatList<EntityItemConfig>>(null);

  // Determine if we should use virtualization
  const useVirtualization = filteredItems.length > VIRTUALIZE_THRESHOLD;

  // Render function for FlatList
  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<EntityItemConfig>) => (
      <EntitySelectorItem
        entity={item}
        poolId={value}
        actionLabel={badge?.label}
        onAction={onItemAction}
      />
    ),
    [value, badge?.label, onItemAction]
  );

  // Key extractor for FlatList
  const keyExtractor = React.useCallback((item: EntityItemConfig) => item.id, []);

  // getItemLayout for optimized FlatList scrolling
  const getItemLayout = React.useCallback(
    (_: ArrayLike<EntityItemConfig> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Handle scrollToIndex failures (item not yet rendered)
  const onScrollToIndexFailed = React.useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      // Wait and retry
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    },
    []
  );

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (!highlightedId || !isActive) return;

    if (useVirtualization) {
      // Use FlatList's scrollToIndex for virtualized lists
      const index = filteredItems.findIndex((item) => item.id === highlightedId);
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }
    } else if (Platform.OS === 'web') {
      // Use DOM scroll for non-virtualized web lists
      const frameId = requestAnimationFrame(() => {
        const escapedId =
          typeof CSS !== 'undefined' && CSS.escape
            ? CSS.escape(highlightedId)
            : highlightedId.replace(/["\\\n\r\t]/g, '\\$&');
        const el = document.querySelector(`[data-entity-id="${escapedId}"]`) as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [highlightedId, isActive, useVirtualization, filteredItems]);

  // Only render when this pool is active
  if (!isActive || !pool) {
    return null;
  }

  // Native accessibility props
  const nativeA11yProps =
    Platform.OS !== 'web'
      ? {
          accessibilityRole: 'list' as const,
          accessibilityLabel: sectionLabel,
        }
      : {};

  // Web-specific ARIA attributes for accessibility
  const webProps =
    Platform.OS === 'web'
      ? ({
          role: 'listbox',
          id: 'entity-selector-listbox',
          'aria-label': sectionLabel,
        } as Record<string, unknown>)
      : {};

  // Section header component
  const SectionHeader = sectionLabel ? (
    <View className="px-2 py-1.5">
      <Text className="text-xs font-medium text-muted-foreground">{sectionLabel}</Text>
    </View>
  ) : null;

  return (
    <View className="px-1 py-1" {...nativeA11yProps} {...webProps}>
      {/* Section heading */}
      {SectionHeader}

      {/* Items list - virtualized or simple based on count */}
      {useVirtualization ? (
        <FlatList
          ref={flatListRef}
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={onScrollToIndexFailed}
          maxToRenderPerBatch={15}
          windowSize={5}
          initialNumToRender={15}
          removeClippedSubviews={Platform.OS !== 'web'}
        />
      ) : (
        filteredItems.map((item) => (
          <EntitySelectorItem
            key={item.id}
            entity={item}
            poolId={value}
            actionLabel={badge?.label}
            onAction={onItemAction}
          />
        ))
      )}
    </View>
  );
}

EntitySelectorPool.displayName = 'EntitySelectorPool';

export { EntitySelectorPool };
