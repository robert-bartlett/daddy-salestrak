/**
 * Command Store - State management using useSyncExternalStore pattern
 *
 * This store manages the state for the command palette component,
 * following the cmdk library's API and behavior patterns.
 */

import { commandScore } from './command-utils';

// Item registration data
type CommandItemData = {
  id: string;
  value: string;
  keywords: string[];
  groupId?: string;
  disabled: boolean;
  onSelect?: (value: string) => void;
  // Track order for stable sorting
  order: number;
};

// Group registration data
type CommandGroupData = {
  id: string;
  // Track order for stable sorting
  order: number;
};

// Filtered state tracking
type FilteredState = {
  count: number;
  items: Map<string, number>; // id → score
  groups: Set<string>; // group ids that have visible items
};

// Complete command state
export type CommandState = {
  search: string;
  value: string; // Currently selected item value
  filtered: FilteredState;
};

// Store options matching cmdk API
export type CommandStoreOptions = {
  /** Override the default filter function */
  filter?: (value: string, search: string, keywords?: string[]) => number;
  /** Disable built-in filtering */
  shouldFilter?: boolean;
  /** Wrap around when navigating past ends */
  loop?: boolean;
  /** Controlled selected value */
  value?: string;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
};

// Internal store type
export type CommandStore = {
  // State access
  getState: () => CommandState;
  subscribe: (listener: () => void) => () => void;

  // Item/Group registration
  registerItem: (data: CommandItemData) => () => void;
  registerGroup: (data: CommandGroupData) => () => void;

  // State mutations
  setSearch: (search: string) => void;
  setValue: (value: string) => void;

  // Navigation
  selectNext: () => void;
  selectPrevious: () => void;
  selectFirst: () => void;
  selectLast: () => void;

  // Accessors
  getItemById: (id: string) => CommandItemData | undefined;
  getSelectedItem: () => CommandItemData | undefined;
  getVisibleItems: () => CommandItemData[];

  // Options
  options: CommandStoreOptions;

  // Sync options from parent (controlled updates)
  setOptions: (options: Partial<CommandStoreOptions>) => void;
};

/**
 * Default filter function matching cmdk behavior.
 * Scores are: exact match → 1.0, starts-with → 0.9, contains → 0.7, no match → 0
 */
export function defaultFilter(
  value: string,
  search: string,
  keywords: string[] = []
): number {
  return commandScore(value, search, keywords);
}

/**
 * Creates a new command store instance.
 */
export function createCommandStore(options: CommandStoreOptions = {}): CommandStore {
  // Internal state
  let state: CommandState = {
    search: '',
    value: options.value ?? '',
    filtered: {
      count: 0,
      items: new Map(),
      groups: new Set(),
    },
  };

  // Registered items and groups
  const items = new Map<string, CommandItemData>();
  const groups = new Map<string, CommandGroupData>();
  const valueToId = new Map<string, string>();

  // Subscribers for useSyncExternalStore
  const listeners = new Set<() => void>();

  // Counter for stable ordering
  let orderCounter = 0;

  // Batch update tracking to prevent cascading emits
  let isBatching = false;
  let pendingEmit = false;

  // Get filter function
  const getFilter = () => options.filter ?? defaultFilter;

  // Notify all subscribers (batching-aware)
  const emit = () => {
    if (isBatching) {
      pendingEmit = true;
      return;
    }
    listeners.forEach((listener) => listener());
  };

  // Run a batched operation - only emit once at the end
  const batch = (fn: () => void) => {
    const wasBatching = isBatching;
    isBatching = true;
    pendingEmit = false;
    try {
      fn();
    } finally {
      isBatching = wasBatching;
      if (!wasBatching && pendingEmit) {
        pendingEmit = false;
        listeners.forEach((listener) => listener());
      }
    }
  };

  // Recompute filtered state (does not emit - caller is responsible)
  const refilter = () => {
    const filter = getFilter();
    const search = state.search;
    const shouldFilter = options.shouldFilter !== false;

    const filteredItems = new Map<string, number>();
    const filteredGroups = new Set<string>();
    let count = 0;

    // Score and filter items
    for (const [id, item] of items) {
      let score = 1;

      if (shouldFilter && search) {
        score = filter(item.value, search, item.keywords);
      }

      if (score > 0) {
        filteredItems.set(id, score);
        count++;

        // Track which groups have visible items
        if (item.groupId) {
          filteredGroups.add(item.groupId);
        }
      }
    }

    state = {
      ...state,
      filtered: {
        count,
        items: filteredItems,
        groups: filteredGroups,
      },
    };

    // If current selection is filtered out, select first visible
    if (state.value) {
      const selectedId = valueToId.get(state.value);
      if (!selectedId || !filteredItems.has(selectedId)) {
        const visibleItems = getVisibleItemsInternal();
        if (visibleItems.length > 0) {
          const newValue = visibleItems[0].value;
          requestValueChange(newValue);
        } else {
          requestValueChange('');
        }
      }
    }
  };

  // Get visible (non-filtered) items sorted by order
  const getVisibleItemsInternal = (): CommandItemData[] => {
    const result: CommandItemData[] = [];

    for (const [id, item] of items) {
      if (!item.disabled && state.filtered.items.has(id)) {
        result.push(item);
      }
    }

    // Sort by order for stable navigation
    result.sort((a, b) => a.order - b.order);

    return result;
  };

  // Internal value update (does not emit - for use within batch operations)
  const requestValueChange = (newValue: string) => {
    // If controlled, only call callback
    if (options.value !== undefined) {
      if (options.value !== newValue) {
        options.onValueChange?.(newValue);
      }
      return;
    }

    // Uncontrolled: update internal state
    if (state.value !== newValue) {
      state = { ...state, value: newValue };
      options.onValueChange?.(newValue);
    }
  };

  // Update value with controlled/uncontrolled handling (emits)
  const updateValue = (newValue: string) => {
    requestValueChange(newValue);
    emit();
  };

  // Navigation helpers
  const findItemIndex = (items: CommandItemData[], id: string): number => {
    return items.findIndex((item) => item.id === id);
  };

  const store: CommandStore = {
    getState: () => state,

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    registerItem: (data) => {
      const itemData = { ...data, order: orderCounter++ };
      items.set(data.id, itemData);
      valueToId.set(data.value, data.id);

      // Batch all state updates to prevent cascading emits
      batch(() => {
        refilter();

        // If no selection yet, select this item
        if (!state.value) {
          const visible = getVisibleItemsInternal();
          if (visible.length > 0 && visible[0].id === data.id) {
            requestValueChange(data.value);
          }
        }

        emit(); // Mark that we need to notify subscribers
      });

      // Cleanup function
      return () => {
        items.delete(data.id);
        if (valueToId.get(itemData.value) === data.id) {
          valueToId.delete(itemData.value);
        }
        batch(() => {
          refilter();
          emit(); // Mark that we need to notify subscribers
        });
      };
    },

    registerGroup: (data) => {
      groups.set(data.id, { ...data, order: orderCounter++ });
      emit();

      return () => {
        groups.delete(data.id);
        emit();
      };
    },

    setSearch: (search) => {
      if (state.search !== search) {
        batch(() => {
          state = { ...state, search };
          refilter();
          emit(); // Mark that we need to notify subscribers
        });
      }
    },

    setValue: (value) => {
      updateValue(value);
    },

    selectNext: () => {
      const visible = getVisibleItemsInternal();
      if (visible.length === 0) return;

      const currentId = state.value ? valueToId.get(state.value) : undefined;
      const currentIndex = currentId ? findItemIndex(visible, currentId) : -1;

      let nextIndex: number;
      if (currentIndex === -1) {
        nextIndex = 0;
      } else if (currentIndex === visible.length - 1) {
        // At end - wrap if loop enabled
        nextIndex = options.loop ? 0 : currentIndex;
      } else {
        nextIndex = currentIndex + 1;
      }

      updateValue(visible[nextIndex].value);
    },

    selectPrevious: () => {
      const visible = getVisibleItemsInternal();
      if (visible.length === 0) return;

      const currentId = state.value ? valueToId.get(state.value) : undefined;
      const currentIndex = currentId ? findItemIndex(visible, currentId) : -1;

      let prevIndex: number;
      if (currentIndex === -1) {
        prevIndex = visible.length - 1;
      } else if (currentIndex === 0) {
        // At start - wrap if loop enabled
        prevIndex = options.loop ? visible.length - 1 : 0;
      } else {
        prevIndex = currentIndex - 1;
      }

      updateValue(visible[prevIndex].value);
    },

    selectFirst: () => {
      const visible = getVisibleItemsInternal();
      if (visible.length > 0) {
        updateValue(visible[0].value);
      }
    },

    selectLast: () => {
      const visible = getVisibleItemsInternal();
      if (visible.length > 0) {
        updateValue(visible[visible.length - 1].value);
      }
    },

    getItemById: (id) => items.get(id),

    getSelectedItem: () => {
      if (!state.value) return undefined;
      const selectedId = valueToId.get(state.value);
      return selectedId ? items.get(selectedId) : undefined;
    },

    getVisibleItems: getVisibleItemsInternal,

    options,
    setOptions: (newOptions) => {
      const shouldRefilter =
        newOptions.filter !== undefined || newOptions.shouldFilter !== undefined;

      batch(() => {
        Object.assign(options, newOptions);

        if (newOptions.value !== undefined && state.value !== newOptions.value) {
          state = { ...state, value: newOptions.value };
        }

        if (shouldRefilter) {
          refilter();
        }

        emit(); // Mark that we need to notify subscribers
      });
    },
  };

  return store;
}

/**
 * Update store options (for controlled value changes from parent).
 * This is used internally to sync controlled props.
 */
export function updateStoreOptions(
  store: CommandStore,
  newOptions: Partial<CommandStoreOptions>
): void {
  store.setOptions(newOptions);
}
