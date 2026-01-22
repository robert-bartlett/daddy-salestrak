/**
 * Command Input - Search input component for the command palette
 *
 * Wraps the base Input component and connects to the command store
 * for search functionality.
 */

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import {
  Platform,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type TextInputProps,
} from 'react-native';
import { useCommand, useCommandListId, useCommandSearch } from './command-context';

export type CommandInputProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  /** Controlled value (overrides internal search state) */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Hide the search icon */
  hideIcon?: boolean;
  /** Custom icon className */
  iconClassName?: string;
  /** Wrapper className */
  wrapperClassName?: string;
};

/**
 * CommandInput - Search input for filtering command items.
 *
 * @ref Forwards to the underlying TextInput element.
 *
 * @remarks
 * - Automatically syncs with command store search state
 * - Supports controlled value/onValueChange for external control
 * - Renders search icon by default
 * - ARIA combobox role for accessibility
 *
 * @example
 * ```tsx
 * <Command>
 *   <CommandInput placeholder="Search commands..." />
 *   <CommandList>...</CommandList>
 * </Command>
 * ```
 */
const CommandInput = React.forwardRef<TextInput, CommandInputProps>(
  (
    {
      value: controlledValue,
      onValueChange,
      placeholder = 'Search...',
      autoFocus = false,
      hideIcon = false,
      iconClassName,
      wrapperClassName,
      className,
      ...props
    },
    ref
  ) => {
    const store = useCommand();
    const storeSearch = useCommandSearch();
    const listId = useCommandListId();

    // Use controlled value if provided, otherwise use store search
    const value = controlledValue ?? storeSearch;

    const handleChangeText = React.useCallback(
      (text: string) => {
        // Update store search state
        store.setSearch(text);

        // Call external handler if provided
        onValueChange?.(text);
      },
      [store, onValueChange]
    );

    // Handle keyboard navigation (arrow keys) from within the input
    // This is necessary because arrow key events are consumed by the TextInput
    // and don't bubble up to the window's keydown listener
  const handleKeyPress = React.useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const key = event.nativeEvent.key;

        switch (key) {
          case 'ArrowDown':
            event.preventDefault?.();
            store.selectNext();
            break;
          case 'ArrowUp':
            event.preventDefault?.();
            store.selectPrevious();
            break;
          case 'Home':
            // Only navigate list when input is empty to avoid conflicting with text cursor movement
            if (!value) {
              event.preventDefault?.();
              store.selectFirst();
            }
            break;
          case 'End':
            // Only navigate list when input is empty to avoid conflicting with text cursor movement
            if (!value) {
              event.preventDefault?.();
              store.selectLast();
            }
            break;
          case 'Enter': {
            const selectedItem = store.getSelectedItem();
            if (selectedItem && !selectedItem.disabled) {
              event.preventDefault?.();
              selectedItem.onSelect?.(selectedItem.value);
            }
            break;
        }
      }
    },
    [store, value]
  );

    // Build children array to avoid whitespace text nodes between JSX elements
    const viewChildren = [
      !hideIcon && (
        <Icon
          key="search-icon"
          as={Search}
          className={cn(
            'size-4 shrink-0 text-muted-foreground',
            Platform.select({ web: 'pointer-events-none' }),
            iconClassName
          )}
        />
      ),
      <TextInput
        key="input"
        ref={ref}
        value={value}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect={false}
        spellCheck={false}
        accessibilityRole="search"
        className={cn(
          'text-foreground flex-1 bg-transparent py-3 text-sm outline-none',
          Platform.select({
            web: 'placeholder:text-muted-foreground h-10 disabled:cursor-not-allowed disabled:opacity-50',
            default: 'placeholder:text-muted-foreground/50',
          }),
          className
        )}
        {...(Platform.OS === 'web' && {
          'data-cmdk-input': '',
          role: 'combobox',
          'aria-expanded': true,
          'aria-autocomplete': 'list',
          'aria-controls': listId,
        })}
        {...props}
      />,
    ].filter(Boolean);

    return (
      <View
        className={cn(
          'flex flex-row items-center gap-2 border-b border-border px-3',
          wrapperClassName
        )}
      >{viewChildren}</View>
    );
  }
);

CommandInput.displayName = 'CommandInput';

export { CommandInput };
