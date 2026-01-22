/**
 * Command Empty - Shown when no results match the search
 *
 * Displays a message when the filtered count is 0.
 */

import { wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { useCommand, useCommandFilteredCount } from './command-context';

// Data attribute for cmdk compatibility
const CMDK_EMPTY_ATTR = 'cmdk-empty';

export type CommandEmptyProps = ViewProps & {
  /** Content to display when empty */
  children?: React.ReactNode;
};

/**
 * CommandEmpty - Displays when no items match the search.
 *
 * @ref Forwards to the View element.
 *
 * @remarks
 * - Automatically shows/hides based on filtered count
 * - Only shows when `shouldFilter` is not false
 * - Typically contains a "No results" message
 *
 * @example
 * ```tsx
 * <CommandList>
 *   <CommandEmpty>No results found.</CommandEmpty>
 *   <CommandGroup>
 *     <CommandItem value="item">Item</CommandItem>
 *   </CommandGroup>
 * </CommandList>
 * ```
 */
const CommandEmpty = React.forwardRef<View, CommandEmptyProps>(
  ({ className, children, ...props }, ref) => {
    const store = useCommand();
    const filteredCount = useCommandFilteredCount();

    // Don't show if filtering is disabled
    const shouldFilter = store.options.shouldFilter !== false;

    // Show when there are no visible items
    const shouldShow = shouldFilter && filteredCount === 0;

    if (!shouldShow) {
      return null;
    }

    return (
      <View
        ref={ref}
        className={cn(
          'items-center justify-center py-6 text-center text-sm text-muted-foreground',
          className
        )}
        {...(Platform.OS === 'web' && {
          'data-cmdk-empty': '',
          role: 'presentation',
        })}
        {...props}
      >{wrapTextChildren(children)}</View>
    );
  }
);

CommandEmpty.displayName = 'CommandEmpty';

export { CommandEmpty };
