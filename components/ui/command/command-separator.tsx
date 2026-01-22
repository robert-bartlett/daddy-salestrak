/**
 * Command Separator - Visual divider between items/groups
 *
 * Renders a horizontal line to separate sections of the command palette.
 * By default only shows when search is empty, unless alwaysRender is true.
 */

import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { useCommandSearch } from './command-context';

// Data attribute for cmdk compatibility
const CMDK_SEPARATOR_ATTR = 'cmdk-separator';

export type CommandSeparatorProps = ViewProps & {
  /** Always render, even when search is active */
  alwaysRender?: boolean;
};

/**
 * CommandSeparator - Visual divider in the command list.
 *
 * @ref Forwards to the View element.
 *
 * @remarks
 * - By default, only renders when search is empty (cmdk behavior)
 * - Use `alwaysRender` to show regardless of search state
 * - Uses role="separator" for accessibility
 *
 * @example
 * ```tsx
 * <CommandList>
 *   <CommandGroup heading="Actions">
 *     <CommandItem value="new">New</CommandItem>
 *   </CommandGroup>
 *   <CommandSeparator />
 *   <CommandGroup heading="Settings">
 *     <CommandItem value="prefs">Preferences</CommandItem>
 *   </CommandGroup>
 * </CommandList>
 *
 * // Always visible separator
 * <CommandSeparator alwaysRender />
 * ```
 */
const CommandSeparator = React.forwardRef<View, CommandSeparatorProps>(
  ({ alwaysRender = false, className, ...props }, ref) => {
    const search = useCommandSearch();

    // Default behavior: only show when search is empty
    const shouldShow = alwaysRender || !search;

    if (!shouldShow) {
      return null;
    }

    return (
      <View
        ref={ref}
        className={cn(
          '-mx-1 my-1 h-px bg-border',
          className
        )}
        accessibilityRole="none"
        {...(Platform.OS === 'web' && {
          'data-cmdk-separator': '',
          role: 'separator',
        })}
        {...props}
      />
    );
  }
);

CommandSeparator.displayName = 'CommandSeparator';

export { CommandSeparator };
