/**
 * Command Loading - Shows during async operations
 *
 * Displays a loading indicator when the command palette
 * is fetching or processing data.
 */

import { wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { useCommandLoading } from './command-context';

// Data attribute for cmdk compatibility
const CMDK_LOADING_ATTR = 'cmdk-loading';

export type CommandLoadingProps = ViewProps & {
  /** Custom loading progress (0-100) for accessibility */
  progress?: number;
  /** Content to display while loading */
  children?: React.ReactNode;
};

/**
 * CommandLoading - Displays during async operations.
 *
 * @ref Forwards to the View element.
 *
 * @remarks
 * - Shows when loading state is true
 * - Use `useCommandLoading().setLoading(true)` to show
 * - Typically contains a spinner or "Loading..." text
 *
 * @example
 * ```tsx
 * function MyCommand() {
 *   const { setLoading } = useCommandLoading();
 *
 *   const fetchData = async () => {
 *     setLoading(true);
 *     await loadData();
 *     setLoading(false);
 *   };
 *
 *   return (
 *     <Command>
 *       <CommandList>
 *         <CommandLoading>Loading...</CommandLoading>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * ```
 */
const CommandLoading = React.forwardRef<View, CommandLoadingProps>(
  ({ progress, className, children, ...props }, ref) => {
    const { loading } = useCommandLoading();

    if (!loading) {
      return null;
    }

    return (
      <View
        ref={ref}
        className={cn(
          'py-6 text-center text-sm text-muted-foreground',
          className
        )}
        accessibilityRole="progressbar"
        accessibilityValue={progress !== undefined
          ? { now: progress, min: 0, max: 100 }
          : undefined}
        {...(Platform.OS === 'web' && {
          'data-cmdk-loading': '',
          role: 'progressbar',
          'aria-valuenow': progress,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-label': 'Loading...',
        })}
        {...props}
      >{wrapTextChildren(children ?? 'Loading...')}</View>
    );
  }
);

CommandLoading.displayName = 'CommandLoading';

export { CommandLoading };
