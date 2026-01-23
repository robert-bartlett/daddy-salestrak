/**
 * Combobox List - Scrollable container for combobox items
 *
 * Thin wrapper around CommandList with Combobox-specific defaults.
 */

import { CommandList, type CommandListProps } from '@/components/ui/command';
import * as React from 'react';
import { ScrollView } from 'react-native';

// Maximum height for the list (matches Select component)
const COMBOBOX_LIST_MAX_HEIGHT = 208; // equivalent to max-h-52 (13rem = 208px)

export type ComboboxListProps = CommandListProps;

/**
 * ComboboxList - Scrollable container for combobox items.
 *
 * @remarks
 * - Thin wrapper around CommandList
 * - Default max height of 208px (matches Select)
 * - Handles scroll-into-view for selected items
 *
 * @example
 * ```tsx
 * <ComboboxList>
 *   <ComboboxItem value="opt1">Option 1</ComboboxItem>
 *   <ComboboxItem value="opt2">Option 2</ComboboxItem>
 * </ComboboxList>
 *
 * // Custom max height
 * <ComboboxList maxHeight={300}>
 *   ...
 * </ComboboxList>
 * ```
 */
const ComboboxList = React.forwardRef<ScrollView, ComboboxListProps>(
  ({ maxHeight = COMBOBOX_LIST_MAX_HEIGHT, ...props }, ref) => {
    return <CommandList ref={ref} maxHeight={maxHeight} {...props} />;
  }
);

ComboboxList.displayName = 'ComboboxList';

export { ComboboxList };
