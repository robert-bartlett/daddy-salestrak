/**
 * Command Root - Main container component with keyboard navigation
 *
 * This is the root component that provides context and handles
 * keyboard navigation for the command palette.
 */

import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { CommandProvider } from './command-context';
import {
  createCommandStore,
  updateStoreOptions,
  type CommandStoreOptions,
} from './command-store';
import { filterWhitespaceChildren, type CommandFilterFn } from './command-utils';

export type CommandProps = ViewProps & {
  /** Controlled selected value */
  value?: string;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
  /** Custom filter function */
  filter?: CommandFilterFn;
  /** Disable built-in filtering (default: true) */
  shouldFilter?: boolean;
  /** Wrap around when navigating past ends (default: false) */
  loop?: boolean;
  /** Accessibility label for the command menu */
  label?: string;
  /** Children components */
  children?: React.ReactNode;
};

/**
 * Command - Root container for the command palette.
 *
 * @ref Forwards to the root View element.
 *
 * @remarks
 * - Provides context for all child components
 * - Handles keyboard navigation (web only)
 * - Supports controlled and uncontrolled selection
 * - Matches cmdk API: value, onValueChange, filter, shouldFilter, loop, label
 *
 * @example
 * ```tsx
 * <Command>
 *   <CommandInput placeholder="Search..." />
 *   <CommandList>
 *     <CommandItem value="action-1">Action 1</CommandItem>
 *   </CommandList>
 * </Command>
 * ```
 */
const Command = React.forwardRef<View, CommandProps>(
  (
    {
      value,
      onValueChange,
      filter,
      shouldFilter = true,
      loop = false,
      label,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Create store with initial options
    const storeOptions: CommandStoreOptions = React.useMemo(
      () => ({
        value,
        onValueChange,
        filter,
        shouldFilter,
        loop,
      }),
      // Only create once - updates are handled via updateStoreOptions
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const store = React.useMemo(
      () => createCommandStore(storeOptions),
      [storeOptions]
    );

    // Sync controlled props to store when they change
    React.useEffect(() => {
      updateStoreOptions(store, {
        value,
        onValueChange,
        filter,
        shouldFilter,
        loop,
      });
    }, [store, value, onValueChange, filter, shouldFilter, loop]);

    const localRef = React.useRef<View>(null);

    // Combine refs so parent refs still work
    React.useImperativeHandle(ref, () => localRef.current!, []);

    const rawId = React.useId();
    const listId = React.useMemo(
      () => `cmdk-list-${rawId.replace(/[:]/g, '')}`,
      [rawId]
    );

    React.useEffect(() => {
      if (Platform.OS !== 'web') return;

      const handleKeyDown = (event: KeyboardEvent) => {
        const rootNode = localRef.current as unknown as HTMLElement | null;
        const targetNode = event.target as Node | null;

        // Only handle events originating inside this command instance
        if (!rootNode || !targetNode || !rootNode.contains(targetNode)) {
          return;
        }

        const selectedItem = store.getSelectedItem();

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            store.selectNext();
            break;

          case 'ArrowUp':
            event.preventDefault();
            store.selectPrevious();
            break;

          case 'Home':
            event.preventDefault();
            store.selectFirst();
            break;

          case 'End':
            event.preventDefault();
            store.selectLast();
            break;

          case 'Enter':
            if (selectedItem && !selectedItem.disabled) {
              event.preventDefault();
              selectedItem.onSelect?.(selectedItem.value);
            }
            break;

          default:
            // Cmd/Ctrl + Arrow combinations
            if (event.metaKey || event.ctrlKey) {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                store.selectFirst();
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                store.selectLast();
              }
            }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [store]);

    return (
      <CommandProvider store={store} listId={listId}>
        <View
          ref={localRef}
          className={cn(
            'bg-popover text-popover-foreground flex w-full flex-col overflow-hidden rounded-md',
            className
          )}
          accessibilityRole="none"
          accessibilityLabel={label ?? 'Command menu'}
          {...(Platform.OS === 'web' && {
            'data-cmdk-root': '',
            role: 'application',
            'aria-label': label ?? 'Command menu',
          })}
          {...props}
        >{filterWhitespaceChildren(children)}</View>
      </CommandProvider>
    );
  }
);

Command.displayName = 'Command';

export { Command };
