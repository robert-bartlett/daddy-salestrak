/**
 * EntitySelector Root - Main container component with state management
 *
 * Wraps Popover.Root and provides context for all child components.
 * Supports controlled and uncontrolled state patterns for selections.
 */

import { Popover } from '@/components/ui/popover';
import { useControllableState } from '@/hooks/use-controllable-state';
import * as PopoverPrimitive from '@rn-primitives/popover';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Platform, TextInput } from 'react-native';
import {
  EntitySelectorProvider,
  filterEntityItems,
  type EntitySelectorConfig,
  type EntitySelectorContextValue,
  type EntityItemConfig,
  type EntityPoolConfig,
  type EntitySelection,
  type EntityBadgeConfig,
  type EntityNavigableItem,
} from './entity-selector-context';
import { EntitySelectorHighlightProvider, useEntitySelectorHighlight } from './entity-selector-highlight-context';

// Minimum time between haptic triggers to prevent buzz spam
const HAPTIC_THROTTLE_MS = 100;

export type EntitySelectorRootProps = {
  /** Configuration for the selector (pools, items, etc.) */
  config: EntitySelectorConfig;

  /** Controlled selections */
  value?: EntitySelection[];
  /** Callback when selections change */
  onValueChange?: (selections: EntitySelection[]) => void;
  /** Default selections for uncontrolled mode */
  defaultValue?: EntitySelection[];

  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state */
  defaultOpen?: boolean;

  /** Enable haptic feedback on iOS (default: true) */
  haptics?: boolean;

  /** Children components */
  children: React.ReactNode;
};

/**
 * EntitySelector - Root component that provides state and context.
 *
 * @remarks
 * - Wraps Popover.Root for dropdown positioning
 * - Supports multi-select with pool tracking
 * - Works in both controlled and uncontrolled modes
 * - Manages tab state, search state, and selections
 *
 * @example
 * ```tsx
 * const config = {
 *   pools: [
 *     { id: 'members', label: 'Members', items: members },
 *     { id: 'teams', label: 'Teams', items: teams },
 *   ],
 * };
 *
 * <EntitySelector config={config} value={selections} onValueChange={setSelections}>
 *   <EntitySelectorTrigger placeholder="Set assignees..." />
 *   <EntitySelectorContent>
 *     ...
 *   </EntitySelectorContent>
 * </EntitySelector>
 * ```
 */
function EntitySelectorRoot(props: EntitySelectorRootProps) {
  // Wrap with highlight provider first, then use inner component that can access it
  return (
    <EntitySelectorHighlightProvider>
      <EntitySelectorRootInner {...props} />
    </EntitySelectorHighlightProvider>
  );
}

function EntitySelectorRootInner({
  config,
  value: controlledValue,
  onValueChange,
  defaultValue,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  haptics = true,
  children,
}: EntitySelectorRootProps) {
  // Access highlight context from the provider above
  const { setHighlightedId } = useEntitySelectorHighlight();

  // Selection state
  const [selections, setSelections] = useControllableState<EntitySelection[]>({
    prop: controlledValue,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
  });

  // Open state
  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  // Tab/Pool state - default to first pool or config.defaultPool
  const defaultPoolId = config.defaultPool ?? config.pools[0]?.id ?? '';
  const [activePool, setActivePool] = React.useState(defaultPoolId);

  // Search state
  const [search, setSearch] = React.useState('');

  // Deferred search value for filtering - keeps input responsive while filtering at lower priority
  const deferredSearch = React.useDeferredValue(search);

  // Input ref for focus management
  const inputRef = React.useRef<TextInput>(null);

  const focusInput = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Haptic throttling
  const lastHapticTime = React.useRef(0);

  const triggerHaptic = React.useCallback(() => {
    if ((Platform.OS === 'ios' || Platform.OS === 'android') && haptics) {
      const now = Date.now();
      if (now - lastHapticTime.current >= HAPTIC_THROTTLE_MS) {
        lastHapticTime.current = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
          // Silently ignore haptic failures
        });
      }
    }
  }, [haptics]);

  // Selection handlers
  const toggleSelection = React.useCallback(
    (entity: EntityItemConfig, poolId: string) => {
      const exists = selections.find((s) => s.id === entity.id);
      if (exists) {
        setSelections(selections.filter((s) => s.id !== entity.id));
      } else {
        // Check max selections
        if (config.maxSelections && selections.length >= config.maxSelections) {
          return;
        }
        setSelections([...selections, { id: entity.id, poolId, entity }]);
      }
      triggerHaptic();
    },
    [config.maxSelections, selections, setSelections, triggerHaptic]
  );

  const isSelected = React.useCallback(
    (entityId: string) => {
      return selections.some((s) => s.id === entityId);
    },
    [selections]
  );

  const clearSelections = React.useCallback(() => {
    setSelections([]);
  }, [setSelections]);

  // Pool helpers
  const getPool = React.useCallback(
    (poolId: string): EntityPoolConfig | undefined => {
      return config.pools.find((p) => p.id === poolId);
    },
    [config.pools]
  );

  const getPoolBadge = React.useCallback(
    (poolId: string): EntityBadgeConfig | undefined => {
      return getPool(poolId)?.itemBadge;
    },
    [getPool]
  );

  // Memoized filtered items cache - prevents multiple filterEntityItems calls per render
  // Uses deferredSearch so filtering happens at lower priority, keeping input responsive
  const filteredItemsCache = React.useMemo(() => {
    const cache = new Map<string, EntityItemConfig[]>();
    for (const pool of config.pools) {
      cache.set(pool.id, filterEntityItems(pool.items, deferredSearch));
    }
    return cache;
  }, [config.pools, deferredSearch]);

  const getFilteredItems = React.useCallback(
    (poolId: string): EntityItemConfig[] => filteredItemsCache.get(poolId) ?? [],
    [filteredItemsCache]
  );

  // Get navigable items for keyboard navigation (filtered items from active pool)
  const getNavigableItems = React.useCallback((): EntityNavigableItem[] => {
    const filteredItems = getFilteredItems(activePool);
    return filteredItems.map((entity) => ({
      id: entity.id,
      disabled: entity.disabled,
      entity,
      poolId: activePool,
    }));
  }, [activePool, getFilteredItems]);

  // Reset highlight when pool or search changes
  React.useEffect(() => {
    setHighlightedId(null);
  }, [activePool, search, setHighlightedId]);

  // Reset search and highlight when closing
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setSearch('');
        setHighlightedId(null);
      }
    },
    [setOpen, setHighlightedId]
  );

  // Wrap setActivePool to refocus input after tab change
  const handleSetActivePool = React.useCallback(
    (poolId: string) => {
      setActivePool(poolId);
      // Refocus input after a brief delay to ensure the tab change completes
      requestAnimationFrame(() => {
        focusInput();
      });
    },
    [focusInput]
  );

  // Build context value
  const contextValue: EntitySelectorContextValue = React.useMemo(
    () => ({
      config,
      selections,
      toggleSelection,
      isSelected,
      clearSelections,
      activePool,
      setActivePool: handleSetActivePool,
      search,
      setSearch,
      open: open ?? false,
      onOpenChange: handleOpenChange,
      haptics,
      getPool,
      getPoolBadge,
      getFilteredItems,
      getNavigableItems,
      inputRef,
      focusInput,
    }),
    [
      config,
      selections,
      toggleSelection,
      isSelected,
      clearSelections,
      activePool,
      handleSetActivePool,
      search,
      open,
      handleOpenChange,
      haptics,
      getPool,
      getPoolBadge,
      getFilteredItems,
      getNavigableItems,
      focusInput,
    ]
  );

  // Cast popover props to support controlled open state
  const popoverProps = {
    open,
    onOpenChange: handleOpenChange,
  } as PopoverPrimitive.RootProps;

  return (
    <Popover {...popoverProps}>
      <EntitySelectorProvider value={contextValue}>
        {children}
      </EntitySelectorProvider>
    </Popover>
  );
}

EntitySelectorRoot.displayName = 'EntitySelector';

export { EntitySelectorRoot };
