/**
 * Combobox Root - Main container component with state management
 *
 * Wraps Popover.Root and provides context for all child components.
 * Supports both single-select and multi-select modes with
 * controlled and uncontrolled state patterns.
 */

import { Popover } from '@/components/ui/popover';
import * as PopoverPrimitive from '@rn-primitives/popover';
import * as React from 'react';
import { View } from 'react-native';
import { ComboboxProvider, type ComboboxContextValue } from './combobox-context';

/**
 * Hook for controlled/uncontrolled state management
 * Allows components to work in both controlled and uncontrolled modes
 */
function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: {
  prop?: T;
  defaultProp: T;
  onChange?: (value: T) => void;
}): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolled;

  const setValue = React.useCallback(
    (nextValue: T) => {
      // Always update internal state to keep it in sync, even in controlled mode.
      // This ensures proper behavior if the component transitions between
      // controlled (prop !== undefined) and uncontrolled (prop === undefined) modes.
      setUncontrolled(nextValue);
      onChange?.(nextValue);
    },
    [onChange]
  );

  return [value, setValue];
}

export type ComboboxRootProps = {
  // Single-select (controlled)
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  defaultValue?: string; // For uncontrolled single-select

  // Multi-select (controlled)
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  defaultValues?: string[]; // For uncontrolled multi-select

  // Mode
  multiple?: boolean; // Default: false

  // Open state (controlled)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean; // Default: false

  children: React.ReactNode;
};

/**
 * Combobox - Root component that provides state and context.
 *
 * @remarks
 * - Wraps Popover.Root for dropdown positioning
 * - Supports single-select and multi-select modes
 * - Works in both controlled and uncontrolled modes
 * - Manages item label registry for trigger display
 *
 * @example
 * ```tsx
 * // Single-select
 * <Combobox value={value} onValueChange={setValue}>
 *   <ComboboxTrigger placeholder="Select..." />
 *   <ComboboxContent>
 *     <ComboboxInput />
 *     <ComboboxList>
 *       <ComboboxItem value="option1">Option 1</ComboboxItem>
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 *
 * // Multi-select
 * <Combobox values={values} onValuesChange={setValues} multiple>
 *   <ComboboxTrigger placeholder="Select tags..." />
 *   <ComboboxContent closeOnSelect={false}>
 *     <ComboboxInput />
 *     <ComboboxList>
 *       <ComboboxItem value="tag1">Tag 1</ComboboxItem>
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 * ```
 */
function ComboboxRoot({
  // Single-select props
  value: controlledValue,
  onValueChange,
  defaultValue,

  // Multi-select props
  values: controlledValues,
  onValuesChange,
  defaultValues,

  // Mode
  multiple = false,

  // Open state
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,

  children,
}: ComboboxRootProps) {
  // Single-select state (supports undefined for no selection)
  const [value, setValue] = useControllableState<string | undefined>({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  // Multi-select state
  const [values, setValues] = useControllableState<string[]>({
    prop: controlledValues,
    defaultProp: defaultValues ?? [],
    onChange: onValuesChange,
  });

  // Open state
  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  // Item labels registry - uses ref with state trigger for efficient updates
  const itemLabelsRef = React.useRef<Map<string, string>>(new Map());
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const registerItemLabel = React.useCallback((itemValue: string, label: string) => {
    const currentLabel = itemLabelsRef.current.get(itemValue);
    if (currentLabel !== label) {
      itemLabelsRef.current.set(itemValue, label);
      forceUpdate();
    }
  }, []);

  const unregisterItemLabel = React.useCallback((itemValue: string) => {
    // Simply delete from the map without forcing re-render.
    // Labels will be re-registered when items mount again.
    // Not forcing update prevents infinite loops during unmount.
    // Trade-off: If items are frequently added/removed dynamically, stale entries
    // could accumulate. Consider periodic cleanup if this becomes a memory concern.
    itemLabelsRef.current.delete(itemValue);
  }, []);

  // Selection handlers
  const handleSelect = React.useCallback(
    (itemValue: string) => {
      if (multiple) {
        // Toggle selection for multi-select
        const currentValues = values ?? [];
        const newValues = currentValues.includes(itemValue)
          ? currentValues.filter((v) => v !== itemValue)
          : [...currentValues, itemValue];
        setValues(newValues);
      } else {
        // Set single value (or clear if same value selected)
        setValue(value === itemValue ? undefined : itemValue);
      }
    },
    [multiple, value, values, setValue, setValues]
  );

  const isSelected = React.useCallback(
    (itemValue: string) => {
      if (multiple) {
        return (values ?? []).includes(itemValue);
      }
      return value === itemValue;
    },
    [multiple, value, values]
  );

  // Build context value
  const contextValue: ComboboxContextValue = React.useMemo(
    () => ({
      // Selection state
      multiple,
      value,
      values: values ?? [],

      // Callbacks
      onSelect: handleSelect,
      isSelected,

      // Open state
      open: open ?? false,
      onOpenChange: setOpen,

      // Content config - closeOnSelect defaults based on mode
      closeOnSelect: !multiple,

      // Item labels
      itemLabels: itemLabelsRef.current,
      registerItemLabel,
      unregisterItemLabel,
    }),
    [
      multiple,
      value,
      values,
      handleSelect,
      isSelected,
      open,
      setOpen,
      registerItemLabel,
      unregisterItemLabel,
    ]
  );

  // Cast popover props to support controlled open state.
  // The @rn-primitives/popover types don't expose `open` and `onOpenChange` on RootProps,
  // but the underlying implementation supports them at runtime. This cast is intentional
  // to enable controlled state while avoiding TypeScript errors.
  const popoverProps = {
    open,
    onOpenChange: setOpen,
  } as PopoverPrimitive.RootProps;

  return (
    <View className="flex-1">
      <Popover {...popoverProps}>
        <ComboboxProvider value={contextValue}>{children}</ComboboxProvider>
      </Popover>
    </View>
  );
}

ComboboxRoot.displayName = 'Combobox';

export { ComboboxRoot };
