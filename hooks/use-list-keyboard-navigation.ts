/**
 * useListKeyboardNavigation - Reusable keyboard navigation hook for list-based components
 *
 * Provides keyboard navigation for lists with:
 * - Arrow key navigation (up/down)
 * - Home/End navigation (when input empty)
 * - Cmd/Ctrl + Arrow for first/last
 * - Enter to select
 * - Escape to dismiss
 * - Disabled item skipping
 * - Optional loop navigation
 */

import * as React from 'react';
import {
  Platform,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

// ============================================================================
// Keyboard Action Utility
// ============================================================================

/**
 * Semantic actions that can result from keyboard input in a list context
 */
export type ListKeyboardAction =
  | 'next'
  | 'previous'
  | 'first'
  | 'last'
  | 'select'
  | 'escape'
  | null;

/**
 * Options for determining the keyboard action
 */
export type GetListKeyboardActionOptions = {
  /** Whether the meta key (Cmd on Mac) is pressed */
  metaKey?: boolean;
  /** Whether the ctrl key is pressed */
  ctrlKey?: boolean;
  /** Whether the input is empty - affects Home/End behavior */
  inputEmpty?: boolean;
};

/**
 * Maps a keyboard key to a semantic list navigation action.
 *
 * This is the single source of truth for keyboard shortcuts in list-based components.
 * Both Command and EntitySelector use this to ensure consistent behavior.
 *
 * Key mappings:
 * | Key       | Modifiers | Condition     | Action     |
 * |-----------|-----------|---------------|------------|
 * | ArrowDown | none      | -             | next       |
 * | ArrowUp   | none      | -             | previous   |
 * | ArrowDown | Cmd/Ctrl  | -             | last       |
 * | ArrowUp   | Cmd/Ctrl  | -             | first      |
 * | Home      | none      | input empty   | first      |
 * | End       | none      | input empty   | last       |
 * | Enter     | none      | -             | select     |
 * | Escape    | none      | -             | escape     |
 *
 * @example
 * ```tsx
 * const action = getListKeyboardAction(event.key, {
 *   metaKey: event.metaKey,
 *   ctrlKey: event.ctrlKey,
 *   inputEmpty: !inputValue,
 * });
 *
 * switch (action) {
 *   case 'next': store.selectNext(); break;
 *   case 'previous': store.selectPrevious(); break;
 *   // ...
 * }
 * ```
 */
export function getListKeyboardAction(
  key: string,
  options: GetListKeyboardActionOptions = {}
): ListKeyboardAction {
  const { metaKey = false, ctrlKey = false, inputEmpty = true } = options;
  const hasModifier = metaKey || ctrlKey;

  switch (key) {
    case 'ArrowDown':
      return hasModifier ? 'last' : 'next';

    case 'ArrowUp':
      return hasModifier ? 'first' : 'previous';

    case 'Home':
      // Only navigate list when input is empty to avoid conflicting with text cursor
      return inputEmpty ? 'first' : null;

    case 'End':
      // Only navigate list when input is empty to avoid conflicting with text cursor
      return inputEmpty ? 'last' : null;

    case 'Enter':
      return 'select';

    case 'Escape':
      return 'escape';

    default:
      return null;
  }
}

// ============================================================================
// Types
// ============================================================================

/**
 * Minimum item shape required for navigation
 */
export type NavigableItem = {
  /** Unique identifier */
  id: string;
  /** Whether the item is disabled and should be skipped during navigation */
  disabled?: boolean;
};

/**
 * Options for the keyboard navigation hook
 */
export type UseListKeyboardNavigationOptions<T extends NavigableItem> = {
  /** List of navigable items */
  items: T[];
  /** Currently highlighted item ID */
  highlightedId: string | null;
  /** Callback when highlight changes */
  onHighlightChange: (id: string | null) => void;
  /** Callback when Enter is pressed on highlighted item */
  onSelect?: (item: T) => void;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Whether to loop navigation at list boundaries (default: true) */
  loop?: boolean;
  /** Whether keyboard navigation is enabled (default: true) */
  enabled?: boolean;
  /** Current input value - Home/End only work when this is empty */
  inputValue?: string;
};

/**
 * Return type for the keyboard navigation hook
 */
export type UseListKeyboardNavigationReturn = {
  /** Index of highlighted item in the items array */
  highlightedIndex: number;
  /** Move highlight to next item */
  highlightNext: () => void;
  /** Move highlight to previous item */
  highlightPrevious: () => void;
  /** Move highlight to first item */
  highlightFirst: () => void;
  /** Move highlight to last item */
  highlightLast: () => void;
  /** Handler for TextInput onKeyPress */
  handleKeyPress: (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  /** Setup web keydown listener - returns cleanup function */
  setupWebKeydownListener: () => () => void;
};

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Find the next enabled item index in a direction
 */
function findNextEnabledIndex<T extends NavigableItem>(
  items: T[],
  currentIndex: number,
  direction: 1 | -1,
  loop: boolean
): number {
  if (items.length === 0) return -1;

  // If no current selection, start from appropriate end
  let startIndex: number;
  if (currentIndex === -1) {
    startIndex = direction === 1 ? 0 : items.length - 1;
  } else {
    startIndex = currentIndex + direction;
  }

  // Search in direction
  let index = startIndex;
  const visited = new Set<number>();

  while (!visited.has(index)) {
    // Check bounds
    if (index < 0) {
      if (loop) {
        index = items.length - 1;
      } else {
        return currentIndex >= 0 ? currentIndex : -1;
      }
    } else if (index >= items.length) {
      if (loop) {
        index = 0;
      } else {
        return currentIndex >= 0 ? currentIndex : -1;
      }
    }

    visited.add(index);

    // Check if item is enabled
    if (!items[index].disabled) {
      return index;
    }

    // Continue in direction
    index += direction;
  }

  // All items disabled or we've looped fully
  return currentIndex >= 0 ? currentIndex : -1;
}

/**
 * Find the first enabled item index
 */
function findFirstEnabledIndex<T extends NavigableItem>(items: T[]): number {
  return items.findIndex((item) => !item.disabled);
}

/**
 * Find the last enabled item index
 */
function findLastEnabledIndex<T extends NavigableItem>(items: T[]): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (!items[i].disabled) return i;
  }
  return -1;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for keyboard navigation in list-based components
 *
 * @example
 * ```tsx
 * const {
 *   highlightedId,
 *   handleKeyPress,
 *   setupWebKeydownListener,
 * } = useListKeyboardNavigation({
 *   items: filteredItems,
 *   highlightedId,
 *   onHighlightChange: setHighlightedId,
 *   onSelect: (item) => toggleSelection(item),
 *   onEscape: () => closePopover(),
 * });
 *
 * // In TextInput
 * <TextInput onKeyPress={handleKeyPress} />
 *
 * // For web container focus
 * useEffect(() => setupWebKeydownListener(), [setupWebKeydownListener]);
 * ```
 */
export function useListKeyboardNavigation<T extends NavigableItem>({
  items,
  highlightedId,
  onHighlightChange,
  onSelect,
  onEscape,
  loop = true,
  enabled = true,
  inputValue = '',
}: UseListKeyboardNavigationOptions<T>): UseListKeyboardNavigationReturn {
  // Get current index from ID
  const highlightedIndex = React.useMemo(() => {
    if (!highlightedId) return -1;
    return items.findIndex((item) => item.id === highlightedId);
  }, [items, highlightedId]);

  // Navigation functions
  const highlightNext = React.useCallback(() => {
    if (!enabled) return;
    const nextIndex = findNextEnabledIndex(items, highlightedIndex, 1, loop);
    if (nextIndex >= 0 && nextIndex < items.length) {
      onHighlightChange(items[nextIndex].id);
    }
  }, [enabled, items, highlightedIndex, loop, onHighlightChange]);

  const highlightPrevious = React.useCallback(() => {
    if (!enabled) return;
    const prevIndex = findNextEnabledIndex(items, highlightedIndex, -1, loop);
    if (prevIndex >= 0 && prevIndex < items.length) {
      onHighlightChange(items[prevIndex].id);
    }
  }, [enabled, items, highlightedIndex, loop, onHighlightChange]);

  const highlightFirst = React.useCallback(() => {
    if (!enabled) return;
    const firstIndex = findFirstEnabledIndex(items);
    if (firstIndex >= 0) {
      onHighlightChange(items[firstIndex].id);
    }
  }, [enabled, items, onHighlightChange]);

  const highlightLast = React.useCallback(() => {
    if (!enabled) return;
    const lastIndex = findLastEnabledIndex(items);
    if (lastIndex >= 0) {
      onHighlightChange(items[lastIndex].id);
    }
  }, [enabled, items, onHighlightChange]);

  // Get highlighted item
  const highlightedItem = React.useMemo(() => {
    if (highlightedIndex < 0) return null;
    return items[highlightedIndex];
  }, [items, highlightedIndex]);

  // Handle key events
  const handleKey = React.useCallback(
    (key: string, metaKey: boolean, ctrlKey: boolean): boolean => {
      if (!enabled) return false;

      const action = getListKeyboardAction(key, {
        metaKey,
        ctrlKey,
        inputEmpty: !inputValue,
      });

      switch (action) {
        case 'next':
          highlightNext();
          return true;

        case 'previous':
          highlightPrevious();
          return true;

        case 'first':
          highlightFirst();
          return true;

        case 'last':
          highlightLast();
          return true;

        case 'select':
          if (highlightedItem && !highlightedItem.disabled) {
            onSelect?.(highlightedItem);
            return true;
          }
          return false;

        case 'escape':
          onEscape?.();
          return true;

        default:
          return false;
      }
    },
    [
      enabled,
      inputValue,
      highlightedItem,
      highlightNext,
      highlightPrevious,
      highlightFirst,
      highlightLast,
      onSelect,
      onEscape,
    ]
  );

  // Handler for React Native TextInput onKeyPress
  const handleKeyPress = React.useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const key = event.nativeEvent.key;
      // TextInput doesn't provide modifier keys in onKeyPress
      // We handle modifiers through the web keydown listener instead
      const handled = handleKey(key, false, false);
      if (handled) {
        event.preventDefault?.();
      }
    },
    [handleKey]
  );

  // Setup web keydown listener
  const setupWebKeydownListener = React.useCallback(() => {
    if (Platform.OS !== 'web' || !enabled) {
      return () => {};
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const handled = handleKey(event.key, event.metaKey, event.ctrlKey);
      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKey]);

  return {
    highlightedIndex,
    highlightNext,
    highlightPrevious,
    highlightFirst,
    highlightLast,
    handleKeyPress,
    setupWebKeydownListener,
  };
}
