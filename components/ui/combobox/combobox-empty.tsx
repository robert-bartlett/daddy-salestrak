/**
 * Combobox Empty - Shown when no results match the search
 *
 * Thin wrapper around CommandEmpty.
 */

import { CommandEmpty, type CommandEmptyProps } from '@/components/ui/command';
import * as React from 'react';
import { View } from 'react-native';

export type ComboboxEmptyProps = CommandEmptyProps;

/**
 * ComboboxEmpty - Displays when no items match the search.
 *
 * @remarks
 * - Thin wrapper around CommandEmpty
 * - Automatically shows/hides based on filtered count
 * - Typically contains a "No results" message
 *
 * @example
 * ```tsx
 * <ComboboxList>
 *   <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
 *   <ComboboxItem value="react">React</ComboboxItem>
 * </ComboboxList>
 * ```
 */
const ComboboxEmpty = React.forwardRef<View, ComboboxEmptyProps>(
  (props, ref) => {
    return <CommandEmpty ref={ref} {...props} />;
  }
);

ComboboxEmpty.displayName = 'ComboboxEmpty';

export { ComboboxEmpty };
