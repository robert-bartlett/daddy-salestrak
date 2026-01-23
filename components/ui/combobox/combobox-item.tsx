/**
 * Combobox Item - Selectable item with checkmark indicator
 *
 * Wraps CommandItem and integrates with Combobox selection state.
 * Registers its label with the root for trigger display.
 */

import { CommandItem, type CommandItemProps } from '@/components/ui/command';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useCombobox } from './combobox-context';

/**
 * Helper function to extract text content from React children.
 * Used to get the display label for the trigger.
 */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    if (props.children) {
      return extractTextFromChildren(props.children);
    }
  }
  return '';
}

export type ComboboxItemProps = Omit<CommandItemProps, 'onSelect'> & {
  /** Unique value for this item (required) */
  value: string;
  /** Additional keywords for filtering */
  keywords?: string[];
  /** Disable this item */
  disabled?: boolean;
  /** Children content (display label) */
  children?: React.ReactNode;
  /** Additional className */
  className?: string;
};

/**
 * ComboboxItem - Selectable item in the combobox dropdown.
 *
 * @remarks
 * - Shows checkmark when selected
 * - Registers label with root for trigger display
 * - Handles selection toggle and close behavior
 * - Wraps CommandItem for filtering/keyboard support
 *
 * @example
 * ```tsx
 * <ComboboxItem value="react">React</ComboboxItem>
 *
 * // With keywords for better filtering
 * <ComboboxItem value="nextjs" keywords={["next", "react", "ssr"]}>
 *   Next.js
 * </ComboboxItem>
 *
 * // Disabled item
 * <ComboboxItem value="legacy" disabled>
 *   Legacy Option
 * </ComboboxItem>
 * ```
 */
const ComboboxItem = React.forwardRef<View, ComboboxItemProps>(
  ({ value, keywords, disabled = false, children, className, ...props }, ref) => {
    const {
      onSelect,
      isSelected,
      closeOnSelect,
      onOpenChange,
      registerItemLabel,
      unregisterItemLabel,
    } = useCombobox();

    const selected = isSelected(value);

    // Memoize extracted label to avoid recalculating on every render
    // Falls back to value if children contains only non-text elements (e.g., icons)
    const label = React.useMemo(() => {
      const extractedText =
        typeof children === 'string'
          ? children
          : extractTextFromChildren(children);
      return extractedText || value;
    }, [children, value]);

    // Register label for trigger display
    React.useEffect(() => {
      registerItemLabel(value, label);
      return () => unregisterItemLabel(value);
    }, [value, label, registerItemLabel, unregisterItemLabel]);

    // Handle selection
    const handleSelect = React.useCallback(() => {
      if (disabled) return;
      onSelect(value);
      if (closeOnSelect) {
        onOpenChange(false);
      }
    }, [value, disabled, onSelect, closeOnSelect, onOpenChange]);

    return (
      <CommandItem
        ref={ref}
        value={value}
        keywords={keywords}
        disabled={disabled}
        onSelect={handleSelect}
        className={cn('relative pl-8', className)}
        {...props}
      >
        <View className="absolute left-2 flex size-3.5 items-center justify-center">
          {selected && (
            <Icon as={Check} size={16} className="text-foreground" />
          )}
        </View>
        {children}
      </CommandItem>
    );
  }
);

ComboboxItem.displayName = 'ComboboxItem';

export { ComboboxItem };
