/**
 * EntitySelector Trigger - Search input that opens the popover
 *
 * Displays the search input and selection summary.
 * Opens the popover when focused/pressed.
 */

import { Icon } from '@/components/ui/icon';
import { PopoverTrigger } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronsUpDown } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useEntitySelector } from './entity-selector-context';

export type EntitySelectorTriggerProps = {
  /** Placeholder text when no selections */
  placeholder?: string;
  /** Whether the trigger is disabled */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
};

/**
 * EntitySelectorTrigger - Button that opens the entity selector dropdown.
 *
 * @remarks
 * - Always fills container width
 * - Shows selection count or placeholder
 * - Styled to match other form inputs
 *
 * @example
 * ```tsx
 * <EntitySelectorTrigger placeholder="Set assignees..." />
 * ```
 */
const EntitySelectorTrigger = React.forwardRef<View, EntitySelectorTriggerProps>(
  ({ placeholder = 'Select...', disabled = false, testID }, ref) => {
    const { selections, open, config } = useEntitySelector();

    // Compute display text based on selection count
    const displayText = React.useMemo(() => {
      if (selections.length === 0) return null;
      if (selections.length === 1) {
        return selections[0].entity.title;
      }
      return `${selections.length} selected`;
    }, [selections]);

    const showPlaceholder = !displayText;

    return (
      <PopoverTrigger asChild>
        <Pressable
          ref={ref}
          disabled={disabled}
          testID={testID}
          accessibilityRole="combobox"
          accessibilityState={{ expanded: open, disabled }}
          className={cn(
            'flex flex-row items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 shadow-sm shadow-black/5 dark:bg-input/30 dark:active:bg-input/50',
            Platform.select({
              web: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
            }),
            disabled && 'opacity-50',
            'h-10 w-full sm:h-9'
          )}
          {...(Platform.OS === 'web' && {
            role: 'combobox',
            'aria-expanded': open,
            'aria-haspopup': 'listbox',
          })}
        >
          <Text
            className={cn(
              'flex-1 truncate text-sm',
              showPlaceholder && 'text-muted-foreground'
            )}
          >
            {displayText ?? (config.searchPlaceholder || placeholder)}
          </Text>
          <Icon
            as={ChevronsUpDown}
            aria-hidden={true}
            className="size-4 shrink-0 text-muted-foreground"
          />
        </Pressable>
      </PopoverTrigger>
    );
  }
);

EntitySelectorTrigger.displayName = 'EntitySelectorTrigger';

export { EntitySelectorTrigger };
