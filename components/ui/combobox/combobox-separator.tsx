/**
 * Combobox Separator - Visual divider between items/groups
 *
 * Thin wrapper around CommandSeparator.
 */

import { CommandSeparator, type CommandSeparatorProps } from '@/components/ui/command';
import * as React from 'react';
import { View } from 'react-native';

export type ComboboxSeparatorProps = CommandSeparatorProps;

/**
 * ComboboxSeparator - Visual divider in the combobox list.
 *
 * @remarks
 * - Thin wrapper around CommandSeparator
 * - By default, only renders when search is empty
 * - Use `alwaysRender` to show regardless of search state
 *
 * @example
 * ```tsx
 * <ComboboxList>
 *   <ComboboxGroup heading="Frameworks">
 *     <ComboboxItem value="react">React</ComboboxItem>
 *   </ComboboxGroup>
 *   <ComboboxSeparator />
 *   <ComboboxGroup heading="Languages">
 *     <ComboboxItem value="typescript">TypeScript</ComboboxItem>
 *   </ComboboxGroup>
 * </ComboboxList>
 * ```
 */
const ComboboxSeparator = React.forwardRef<View, ComboboxSeparatorProps>(
  (props, ref) => {
    return <CommandSeparator ref={ref} {...props} />;
  }
);

ComboboxSeparator.displayName = 'ComboboxSeparator';

export { ComboboxSeparator };
