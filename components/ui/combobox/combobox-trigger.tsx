/**
 * Combobox Trigger - Button that shows selection and opens dropdown
 *
 * Displays the current selection(s) and toggles the dropdown.
 * Styled to match SelectTrigger from select.tsx.
 */

import { Icon } from '@/components/ui/icon';
import { PopoverTrigger } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronsUpDown } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useCombobox } from './combobox-context';

export type ComboboxTriggerProps = {
  placeholder?: string;
  displayMode?: 'list' | 'count'; // Default: 'list'
  maxDisplayItems?: number; // Default: 3
  size?: 'default' | 'sm'; // Default: 'default'
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode; // Custom content override
  testID?: string; // For testing
};

/**
 * ComboboxTrigger - Button that opens the combobox dropdown.
 *
 * @remarks
 * - Always fills container width (container-controlled sizing)
 * - Displays current selection or placeholder
 * - Supports 'list' or 'count' display modes for multi-select
 * - Styled to match SelectTrigger
 *
 * @example
 * ```tsx
 * <ComboboxTrigger placeholder="Select framework..." />
 *
 * // Multi-select with count display
 * <ComboboxTrigger placeholder="Select tags..." displayMode="count" />
 *
 * // Custom content
 * <ComboboxTrigger>
 *   <CustomContent />
 * </ComboboxTrigger>
 * ```
 */
const ComboboxTrigger = React.forwardRef<View, ComboboxTriggerProps>(
  (
    {
      placeholder = 'Select...',
      displayMode = 'list',
      maxDisplayItems = 3,
      size = 'default',
      disabled = false,
      className,
      children,
      testID,
    },
    ref
  ) => {
    const context = useCombobox();
    const { multiple, value, values, itemLabels, open } = context;

    // Compute display text based on selection and mode
    const displayText = React.useMemo(() => {
      if (multiple) {
        if (values.length === 0) return null;
        if (displayMode === 'count') return `${values.length} selected`;

        const labels = values.map((v) => itemLabels.get(v) ?? v);
        if (labels.length <= maxDisplayItems) {
          return labels.join(', ');
        }
        return `${labels.slice(0, maxDisplayItems).join(', ')} +${labels.length - maxDisplayItems} more`;
      }

      return value ? (itemLabels.get(value) ?? value) : null;
    }, [multiple, value, values, itemLabels, displayMode, maxDisplayItems]);

    // Determine if showing placeholder
    const showPlaceholder = !displayText;

    // Render custom children if provided
    if (children) {
      return (
        <PopoverTrigger asChild>
          <Pressable ref={ref} disabled={disabled} testID={testID}>
            {children}
          </Pressable>
        </PopoverTrigger>
      );
    }

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
            size === 'default' && 'h-10 sm:h-9',
            size === 'sm' && 'h-8 py-2 sm:py-1.5',
            'w-full',
            className
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
            {displayText ?? placeholder}
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

ComboboxTrigger.displayName = 'ComboboxTrigger';

export { ComboboxTrigger };
