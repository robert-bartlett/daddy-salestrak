/**
 * EntitySelector Input - Search input for filtering entities
 *
 * Provides a search input that filters items in the active pool.
 * Handles keyboard navigation via useListKeyboardNavigation hook.
 */

import { Icon } from '@/components/ui/icon';
import { useListKeyboardNavigation } from '@/hooks/use-list-keyboard-navigation';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import { Platform, TextInput, View, type TextInputProps } from 'react-native';
import { useEntitySelector, useEntitySelectorHighlight } from './entity-selector-context';

export type EntitySelectorInputProps = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'className' | 'style'
> & {
  /** Placeholder text */
  placeholder?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Hide the search icon */
  hideIcon?: boolean;
};

/**
 * EntitySelectorInput - Search input for filtering entities.
 *
 * @remarks
 * - Syncs with context's search state
 * - Shows search icon by default
 * - Auto-focuses by default when popover opens
 *
 * @example
 * ```tsx
 * <EntitySelectorInput placeholder="Search members..." />
 * ```
 */
const EntitySelectorInput = React.forwardRef<TextInput, EntitySelectorInputProps>(
  ({ placeholder, autoFocus = true, hideIcon = false, ...props }, forwardedRef) => {
    const {
      search,
      setSearch,
      config,
      getNavigableItems,
      toggleSelection,
      activePool,
      onOpenChange,
      inputRef,
    } = useEntitySelector();

    const { highlightedId, setHighlightedId } = useEntitySelectorHighlight();

    // Merge forwarded ref with context's inputRef
    const mergedRef = React.useCallback(
      (node: TextInput | null) => {
        // Set context ref
        (inputRef as React.MutableRefObject<TextInput | null>).current = node;
        // Set forwarded ref
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, inputRef]
    );

    const resolvedPlaceholder = placeholder ?? config.searchPlaceholder ?? 'Search...';

    const handleChangeText = React.useCallback(
      (text: string) => {
        setSearch(text);
      },
      [setSearch]
    );

    // Get navigable items for keyboard navigation
    const navigableItems = React.useMemo(() => getNavigableItems(), [getNavigableItems]);

    // Keyboard navigation hook
    const { handleKeyPress } = useListKeyboardNavigation({
      items: navigableItems,
      highlightedId,
      onHighlightChange: setHighlightedId,
      onSelect: (item) => {
        toggleSelection(item.entity, activePool);
      },
      onEscape: () => {
        onOpenChange(false);
      },
      loop: true,
      enabled: true,
      inputValue: search,
    });

    return (
      <View className="flex flex-row items-center gap-2 border-b border-border px-3">
        {!hideIcon && (
          <Icon
            as={Search}
            className={cn(
              'size-4 shrink-0 text-muted-foreground',
              Platform.select({ web: 'pointer-events-none' })
            )}
          />
        )}
        <TextInput
          ref={mergedRef}
          value={search}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          placeholder={resolvedPlaceholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect={false}
          spellCheck={false}
          accessibilityRole="search"
          aria-activedescendant={highlightedId ? `entity-item-${highlightedId}` : undefined}
          aria-controls="entity-selector-listbox"
          className={cn(
            'text-foreground flex-1 bg-transparent py-3 text-sm outline-none',
            Platform.select({
              web: 'placeholder:text-muted-foreground h-10 disabled:cursor-not-allowed disabled:opacity-50',
              default: 'placeholder:text-muted-foreground/50',
            })
          )}
          {...props}
        />
      </View>
    );
  }
);

EntitySelectorInput.displayName = 'EntitySelectorInput';

export { EntitySelectorInput };
