/**
 * Command Item - Selectable item within the command palette
 *
 * Each item auto-registers with the store and handles selection,
 * pointer interactions, and accessibility.
 */

import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, Pressable, View, type PressableProps } from 'react-native';
import {
  useCommand,
  useCommandGroup,
  useCommandItemSelected,
  useCommandItemVisible,
} from './command-context';
import { useCommandList } from './command-list';
import { generateId } from './command-utils';

// Data attribute for cmdk compatibility
const CMDK_ITEM_ATTR = 'cmdk-item';

export type CommandItemProps = Omit<PressableProps, 'onPress' | 'children'> & {
  /** Unique value for this item (required) */
  value: string;
  /** Additional keywords for filtering */
  keywords?: string[];
  /** Disable this item */
  disabled?: boolean;
  /** Callback when item is selected */
  onSelect?: (value: string) => void;
  /** Always render even when filtered out */
  forceMount?: boolean;
  /** Children content */
  children?: React.ReactNode;
};

/**
 * CommandItem - Selectable item in the command palette.
 *
 * @ref Forwards to the Pressable element.
 *
 * @remarks
 * - Requires explicit `value` prop (does not infer from text)
 * - Auto-registers with the command store on mount
 * - Handles pointer enter to update selection (web)
 * - Supports `forceMount` to always render
 * - Uses `hidden` attribute when filtered out (not unmount)
 *
 * @example
 * ```tsx
 * <CommandItem value="copy" onSelect={() => handleCopy()}>
 *   Copy to clipboard
 * </CommandItem>
 *
 * <CommandItem value="search" keywords={["find", "lookup"]}>
 *   Search
 * </CommandItem>
 * ```
 */
const CommandItem = React.forwardRef<View, CommandItemProps>(
  (
    {
      value,
      keywords = [],
      disabled = false,
      onSelect,
      forceMount = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const store = useCommand();
    const groupContext = useCommandGroup();
    const listContext = useCommandList();

    // Generate stable ID for this item
    const itemId = React.useMemo(() => generateId('item'), []);

    // Get reactive state
    const isSelected = useCommandItemSelected(value);
    const isVisible = useCommandItemVisible(itemId);

    // Local ref for scroll-into-view registration
    const localRef = React.useRef<View>(null);
    const onSelectRef = React.useRef(onSelect);

    React.useEffect(() => {
      onSelectRef.current = onSelect;
    }, [onSelect]);

    const handleSelect = React.useCallback((selectedValue: string) => {
      onSelectRef.current?.(selectedValue);
    }, []);

    // Combine refs
    React.useImperativeHandle(ref, () => localRef.current!, []);

    // Stringify keywords for stable dependency comparison
    // This prevents re-registration when keywords array is recreated with same values
    const keywordsKey = JSON.stringify(keywords);

    // Register item with store on mount
    React.useEffect(() => {
      const unregister = store.registerItem({
        id: itemId,
        value,
        keywords,
        groupId: groupContext?.id,
        disabled,
        onSelect: handleSelect,
        order: 0, // Will be set by store
      });

      return unregister;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, itemId, value, keywordsKey, groupContext?.id, disabled, handleSelect]);

    // Register with list context for scroll-into-view
    React.useEffect(() => {
      if (listContext && localRef.current) {
        listContext.registerItemRef(value, localRef.current);
        return () => listContext.registerItemRef(value, null);
      }
    }, [listContext, value]);

    // Handle item selection
    const handlePress = React.useCallback(() => {
      if (disabled) return;
      store.setValue(value);
      handleSelect(value);
    }, [store, disabled, handleSelect, value]);

    // Handle pointer enter (web only) - update selection on hover
    const handlePointerEnter = React.useCallback(() => {
      if (Platform.OS !== 'web' || disabled) return;
      store.setValue(value);
    }, [store, value, disabled]);

    // Determine if item should be hidden
    const shouldHide = !forceMount && !isVisible && !groupContext?.forceMount;

    // On web, use hidden attribute; on native, return null
    if (shouldHide) {
      if (Platform.OS === 'web') {
        // Render but hidden (cmdk behavior - visibility without unmount)
        return (
          <View
            ref={localRef}
            // @ts-expect-error - hidden is valid on web
            hidden
            style={{ display: 'none' }}
          />
        );
      }
      // On native, we can safely not render
      return null;
    }

    return (
      <TextClassContext.Provider
        value={cn(
          'text-sm select-none',
          isSelected && 'text-accent-foreground'
        )}
      >
        <Pressable
          ref={localRef}
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="menuitem"
          accessibilityState={{
            selected: isSelected,
            disabled,
          }}
          className={cn(
            'relative flex cursor-default select-none flex-row items-center gap-2 rounded-sm px-2 py-1.5 outline-none',
            isSelected && 'bg-accent text-accent-foreground',
            disabled && 'pointer-events-none opacity-50',
            Platform.select({
              web: 'hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            }),
            className
          )}
          // React Native Web uses dataSet prop to set data-* attributes
          dataSet={{
            cmdkItem: '',
            value: value,
            selected: isSelected ? '' : undefined,
            disabled: disabled ? '' : undefined,
          }}
          {...(Platform.OS === 'web' && {
            role: 'option',
            'aria-selected': isSelected,
            'aria-disabled': disabled,
            onPointerEnter: handlePointerEnter,
          })}
          {...props}
        >{wrapTextChildren(children)}</Pressable>
      </TextClassContext.Provider>
    );
  }
);

CommandItem.displayName = 'CommandItem';

export { CommandItem };
