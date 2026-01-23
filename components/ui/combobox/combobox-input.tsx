/**
 * Combobox Input - Search input for filtering items
 *
 * Thin wrapper around CommandInput with Combobox-specific defaults.
 */

import { CommandInput, type CommandInputProps } from '@/components/ui/command';
import * as React from 'react';
import { TextInput } from 'react-native';

export type ComboboxInputProps = CommandInputProps;

/**
 * ComboboxInput - Search input for filtering combobox items.
 *
 * @remarks
 * - Thin wrapper around CommandInput
 * - Auto-focuses when popover opens (default)
 * - Handles keyboard navigation within the input
 *
 * @example
 * ```tsx
 * <ComboboxInput placeholder="Search frameworks..." />
 *
 * // Without icon
 * <ComboboxInput placeholder="Search..." hideIcon />
 * ```
 */
const ComboboxInput = React.forwardRef<TextInput, ComboboxInputProps>(
  ({ autoFocus = true, ...props }, ref) => {
    return <CommandInput ref={ref} autoFocus={autoFocus} {...props} />;
  }
);

ComboboxInput.displayName = 'ComboboxInput';

export { ComboboxInput };
