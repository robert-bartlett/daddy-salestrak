/**
 * Command List - Scrollable container for command items
 *
 * Contains all the command items and groups. Handles scroll-into-view
 * when selection changes.
 */

import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, ScrollView, View, type ScrollViewProps } from 'react-native';
import { useCommandListId, useCommandValue } from './command-context';
import { filterWhitespaceChildren } from './command-utils';

// Data attribute for cmdk compatibility
const CMDK_LIST_ATTR = 'cmdk-list';

// Default list height
const DEFAULT_MAX_HEIGHT = 300;

export type CommandListProps = Omit<ScrollViewProps, 'children'> & {
  /** Maximum height for the list (pixels or CSS value on web) */
  maxHeight?: number | string;
  /** Additional className for the container */
  className?: string;
  /** Children (CommandItem, CommandGroup, etc.) */
  children?: React.ReactNode;
};

/**
 * CommandList - Scrollable container for command items.
 *
 * @ref Forwards to the ScrollView element.
 *
 * @remarks
 * - Handles scroll-into-view when selection changes
 * - Uses role="listbox" for accessibility
 * - Supports custom maxHeight
 *
 * @example
 * ```tsx
 * <Command>
 *   <CommandInput />
 *   <CommandList>
 *     <CommandItem value="item-1">Item 1</CommandItem>
 *   </CommandList>
 * </Command>
 * ```
 */
const CommandList = React.forwardRef<ScrollView, CommandListProps>(
  (
    {
      maxHeight = DEFAULT_MAX_HEIGHT,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const selectedValue = useCommandValue();
    const listId = useCommandListId();
    const scrollViewRef = React.useRef<ScrollView>(null);
    const itemRefs = React.useRef<Map<string, View>>(new Map());

    // Combine refs
    React.useImperativeHandle(ref, () => scrollViewRef.current!, []);

    // Store item ref registration function in context-like manner
    // This will be used by CommandItem to register for scroll-into-view
    const registerItemRef = React.useCallback((value: string, node: View | null) => {
      if (node) {
        itemRefs.current.set(value, node);
      } else {
        itemRefs.current.delete(value);
      }
    }, []);

    // Scroll selected item into view on web
    React.useEffect(() => {
      if (Platform.OS !== 'web' || !selectedValue) return;

      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      const frameId = requestAnimationFrame(() => {
        // Try to find the element via DOM query using data-value attribute
        // This is more reliable than React refs for web scroll behavior
        const listElement = scrollViewRef.current as unknown as HTMLElement;
        // Escape special characters in value for CSS selector
        // Use CSS.escape if available, otherwise basic escaping for common chars
        const escapedValue = typeof CSS !== 'undefined' && CSS.escape
          ? CSS.escape(selectedValue)
          : selectedValue.replace(/["\\\n\r\t]/g, '\\$&');
        const itemElement = listElement?.querySelector(
          `[data-value="${escapedValue}"]`
        ) as HTMLElement | null;

        if (itemElement && typeof itemElement.scrollIntoView === 'function') {
          itemElement.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
          });
        }
      });

      return () => cancelAnimationFrame(frameId);
    }, [selectedValue]);

    // Calculate max height value
    const maxHeightStyle = typeof maxHeight === 'number'
      ? maxHeight
      : undefined;
    const maxHeightWebStyle = typeof maxHeight === 'string'
      ? maxHeight
      : `${maxHeight}px`;

    const webStyle = React.useMemo(() => {
      const inputStyle = props.style;
      const flattenedStyle = Array.isArray(inputStyle)
        ? Object.assign({}, ...inputStyle)
        : inputStyle;
      if (flattenedStyle && typeof flattenedStyle === 'object') {
        return { ...flattenedStyle, maxHeight: maxHeightWebStyle };
      }
      return { maxHeight: maxHeightWebStyle };
    }, [props.style, maxHeightWebStyle]);

    // Web-specific props
    const webProps = Platform.OS === 'web'
      ? {
          [`data-${CMDK_LIST_ATTR}`]: '',
          id: listId,
          role: 'listbox',
          'aria-label': props.accessibilityLabel ?? 'Suggestions',
          'data-testid': props.testID,
          onScroll: props.onScroll,
          onWheel: props.onWheel,
          onKeyDown: props.onKeyDown,
          onKeyUp: props.onKeyUp,
          onFocus: props.onFocus,
          onBlur: props.onBlur,
          onMouseEnter: props.onMouseEnter,
          onMouseLeave: props.onMouseLeave,
          onMouseMove: props.onMouseMove,
          onMouseDown: props.onMouseDown,
          onMouseUp: props.onMouseUp,
          onPointerEnter: props.onPointerEnter,
          onPointerLeave: props.onPointerLeave,
          onPointerMove: props.onPointerMove,
          onPointerDown: props.onPointerDown,
          onPointerUp: props.onPointerUp,
        }
      : undefined;

    // Provide item ref registration through context
    const contextValue = React.useMemo(
      () => ({ registerItemRef }),
      [registerItemRef]
    );

    if (Platform.OS === 'web') {
      // On web, use native <div> for proper CSS overflow scrolling and
      // scrollIntoView support. Native platforms use ScrollView below.
      return (
        <CommandListContext.Provider value={contextValue}>
          <div
            ref={scrollViewRef as unknown as React.Ref<HTMLDivElement>}
            className={cn(
              'overflow-y-auto overflow-x-hidden p-1',
              '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30',
              className
            )}
            style={webStyle}
            {...(webProps as React.HTMLAttributes<HTMLDivElement>)}
          >
            {children}
          </div>
        </CommandListContext.Provider>
      );
    }

    // Native implementation
    return (
      <CommandListContext.Provider value={contextValue}>
        <View style={{ maxHeight: maxHeightStyle }}>
          <ScrollView
            ref={scrollViewRef}
            accessibilityRole="list"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className={cn('p-1', className)}
            {...props}
          >
            {filterWhitespaceChildren(children)}
          </ScrollView>
        </View>
      </CommandListContext.Provider>
    );
  }
);

CommandList.displayName = 'CommandList';

// Context for item ref registration (for scroll-into-view)
type CommandListContextValue = {
  registerItemRef: (value: string, node: View | null) => void;
};

const CommandListContext = React.createContext<CommandListContextValue | null>(null);
CommandListContext.displayName = 'CommandListContext';

/**
 * Hook to access list context for item ref registration.
 */
export function useCommandList(): CommandListContextValue | null {
  return React.useContext(CommandListContext);
}

export { CommandList, CommandListContext };
export type { CommandListContextValue };
