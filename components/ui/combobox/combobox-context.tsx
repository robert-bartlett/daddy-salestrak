/**
 * Combobox Context - React context providers and hooks for Combobox state
 *
 * Provides shared state between all Combobox components, including:
 * - Selection state (single or multi-select)
 * - Open/close state
 * - Item label registry for trigger display
 */

import * as React from 'react';

/**
 * Context value type containing all combobox state and callbacks
 */
export type ComboboxContextValue = {
  // Selection state
  multiple: boolean;
  value: string | undefined; // Single-select value
  values: string[]; // Multi-select values

  // Callbacks
  onSelect: (value: string) => void; // Handles toggle for multi, set for single
  isSelected: (value: string) => boolean;

  // Open state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Content config
  closeOnSelect: boolean;

  // Item labels (for trigger display)
  itemLabels: Map<string, string>;
  registerItemLabel: (value: string, label: string) => void;
  unregisterItemLabel: (value: string) => void;
};

// Main context for combobox state
const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);
ComboboxContext.displayName = 'ComboboxContext';

/**
 * Hook to access the full combobox context.
 * Must be used within a Combobox component.
 *
 * @throws Error if used outside of Combobox
 */
export function useCombobox(): ComboboxContextValue {
  const context = React.useContext(ComboboxContext);
  if (!context) {
    throw new Error('useCombobox must be used within a Combobox component.');
  }
  return context;
}

/**
 * Hook to check if an item is currently selected.
 */
export function useComboboxSelected(value: string): boolean {
  const context = useCombobox();
  return context.isSelected(value);
}

/**
 * Hook to check if combobox is in multi-select mode.
 */
export function useComboboxMultiple(): boolean {
  const context = useCombobox();
  return context.multiple;
}

/**
 * Hook to get the current open state.
 */
export function useComboboxOpen(): boolean {
  const context = useCombobox();
  return context.open;
}

// Provider component types
type ComboboxProviderProps = {
  value: ComboboxContextValue;
  children: React.ReactNode;
};

/**
 * Internal provider component for the combobox context.
 */
function ComboboxProvider({ value, children }: ComboboxProviderProps) {
  return (
    <ComboboxContext.Provider value={value}>
      {children}
    </ComboboxContext.Provider>
  );
}

export { ComboboxContext, ComboboxProvider };
export type { ComboboxProviderProps };
