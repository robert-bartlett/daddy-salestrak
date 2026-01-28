/**
 * useControllableState - Hook for controlled/uncontrolled state management
 *
 * Allows components to work in both controlled and uncontrolled modes,
 * providing a consistent API regardless of how the component is used.
 *
 * @example
 * ```tsx
 * // Uncontrolled usage (internal state)
 * const [value, setValue] = useControllableState({
 *   defaultProp: '',
 * });
 *
 * // Controlled usage (external state)
 * const [value, setValue] = useControllableState({
 *   prop: externalValue,
 *   defaultProp: '',
 *   onChange: setExternalValue,
 * });
 * ```
 */

import * as React from 'react';

export type UseControllableStateOptions<T> = {
  /** Controlled value - if provided, component is in controlled mode */
  prop?: T;
  /** Default value for uncontrolled mode */
  defaultProp: T;
  /** Callback fired when value changes */
  onChange?: (value: T) => void;
};

/**
 * Hook for controlled/uncontrolled state management.
 *
 * When `prop` is provided, the component operates in controlled mode
 * and uses the external value. Otherwise, it manages state internally.
 *
 * @param options - Configuration options
 * @returns Tuple of [value, setValue]
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateOptions<T>): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolled;

  const setValue = React.useCallback(
    (nextValue: T) => {
      setUncontrolled(nextValue);
      onChange?.(nextValue);
    },
    [onChange]
  );

  return [value, setValue];
}
