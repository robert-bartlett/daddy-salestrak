/**
 * Combobox Group - Container for grouping related items
 *
 * Thin wrapper around CommandGroup.
 */

import { CommandGroup, type CommandGroupProps } from '@/components/ui/command';
import * as React from 'react';
import { View } from 'react-native';

export type ComboboxGroupProps = CommandGroupProps;

/**
 * ComboboxGroup - Container for grouping combobox items.
 *
 * @remarks
 * - Thin wrapper around CommandGroup
 * - Renders a heading if provided
 * - Hides when all child items are filtered out
 *
 * @example
 * ```tsx
 * <ComboboxList>
 *   <ComboboxGroup heading="Frontend">
 *     <ComboboxItem value="react">React</ComboboxItem>
 *     <ComboboxItem value="vue">Vue</ComboboxItem>
 *   </ComboboxGroup>
 *   <ComboboxGroup heading="Backend">
 *     <ComboboxItem value="node">Node.js</ComboboxItem>
 *     <ComboboxItem value="python">Python</ComboboxItem>
 *   </ComboboxGroup>
 * </ComboboxList>
 * ```
 */
const ComboboxGroup = React.forwardRef<View, ComboboxGroupProps>(
  (props, ref) => {
    return <CommandGroup ref={ref} {...props} />;
  }
);

ComboboxGroup.displayName = 'ComboboxGroup';

export { ComboboxGroup };
