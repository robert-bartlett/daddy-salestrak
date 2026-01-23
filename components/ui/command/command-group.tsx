/**
 * Command Group - Container for grouping related command items
 *
 * Groups items together with an optional heading. Automatically
 * hides when all child items are filtered out.
 */

import { wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import {
  CommandGroupProvider,
  useCommand,
  useCommandGroupVisible,
} from './command-context';
import { filterWhitespaceChildren, generateId } from './command-utils';

// Data attribute for cmdk compatibility
const CMDK_GROUP_ATTR = 'cmdk-group';
const CMDK_GROUP_HEADING_ATTR = 'cmdk-group-heading';

type CommandGroupProps = ViewProps & {
  /** Heading text for the group */
  heading?: React.ReactNode;
  /** Always render even when all items are filtered out */
  forceMount?: boolean;
  /** Custom className for the heading */
  headingClassName?: string;
  /** Children (CommandItem components) */
  children?: React.ReactNode;
};

/**
 * CommandGroup - Container for grouping command items.
 *
 * @ref Forwards to the root View element.
 *
 * @remarks
 * - Renders a heading if provided
 * - Auto-registers with store and tracks visibility
 * - Hides when all child items are filtered out
 * - Supports `forceMount` to always render
 *
 * @example
 * ```tsx
 * <CommandList>
 *   <CommandGroup heading="Actions">
 *     <CommandItem value="new">New File</CommandItem>
 *     <CommandItem value="open">Open</CommandItem>
 *   </CommandGroup>
 *
 *   <CommandGroup heading="Settings" forceMount>
 *     <CommandItem value="prefs">Preferences</CommandItem>
 *   </CommandGroup>
 * </CommandList>
 * ```
 */
const CommandGroup = React.forwardRef<View, CommandGroupProps>(
  (
    {
      heading,
      forceMount = false,
      headingClassName,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const store = useCommand();

    // Generate stable ID for this group
    const groupId = React.useMemo(() => generateId('group'), []);

    // Get reactive visibility state
    const isVisible = useCommandGroupVisible(groupId);

    // Register group with store on mount
    React.useEffect(() => {
      const unregister = store.registerGroup({
        id: groupId,
        order: 0, // Will be set by store
      });

      return unregister;
    }, [store, groupId]);

    // Determine if group should be hidden
    const shouldHide = !forceMount && !isVisible;
    const hiddenWebStyle = Platform.OS === 'web' && shouldHide ? { display: 'none' as const } : undefined;
    const hiddenNativeStyle = Platform.OS !== 'web' && shouldHide ? { display: 'none' as const } : undefined;

    // Generate heading ID for aria-labelledby
    const headingId = heading ? `${groupId}-heading` : undefined;

    // Always render children so items can register with the store.
    // Hide the group visually when shouldHide is true.
    // Build children array to avoid whitespace text nodes between JSX elements
    const viewChildren = [
      heading && !shouldHide && (
        <CommandGroupHeading
          key="heading"
          id={headingId}
          className={headingClassName}
        >
          {heading}
        </CommandGroupHeading>
      ),
      ...React.Children.toArray(filterWhitespaceChildren(children)),
    ].filter(Boolean);

    return (
      <CommandGroupProvider id={groupId} forceMount={forceMount}>
        <View
          ref={ref}
          className={cn(
            'overflow-hidden p-1',
            className
          )}
          style={[style, hiddenWebStyle, hiddenNativeStyle]}
          accessibilityRole="none"
          {...(Platform.OS === 'web' && {
            'data-cmdk-group': '',
            role: 'presentation',
            'aria-labelledby': headingId,
            // Hide visually but keep in DOM for item registration
            ...(shouldHide && { hidden: true }),
          })}
          {...props}
        >{viewChildren}</View>
      </CommandGroupProvider>
    );
  }
);

CommandGroup.displayName = 'CommandGroup';

// Internal heading component
type CommandGroupHeadingProps = ViewProps & {
  id?: string;
  children?: React.ReactNode;
};

const CommandGroupHeading = React.forwardRef<View, CommandGroupHeadingProps>(
  ({ id, className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          'px-2 py-1.5 text-xs font-medium text-muted-foreground',
          className
        )}
        {...(Platform.OS === 'web' && {
          'data-cmdk-group-heading': '',
          id,
        })}
        {...props}
      >{wrapTextChildren(children)}</View>
    );
  }
);

CommandGroupHeading.displayName = 'CommandGroupHeading';

export { CommandGroup, CommandGroupHeading };
export type { CommandGroupHeadingProps, CommandGroupProps };
