/**
 * Search - A standalone search input for filtering/searching use cases.
 *
 * Unlike Combobox (which is selection-oriented with dropdown), Search is
 * filter-oriented: always visible, no dropdown, results rendered elsewhere.
 */

import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, X } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, TextInput, View, type TextInputProps } from 'react-native';

// Width tokens (matching Input component)
const WIDTH_CLASSES = {
  xs: 'w-16',
  sm: 'w-24',
  md: 'w-32',
  lg: 'w-40',
  xl: 'w-48',
  full: 'w-full',
} as const;

// Base wrapper styles (adapted from Input, using focus-within for nested input)
// Note: width is handled separately via WIDTH_CLASSES to make the default explicit
const BASE_WRAPPER_STYLES =
  'dark:bg-input/30 border-input bg-background flex h-10 min-w-0 flex-row items-center rounded-md border px-3 gap-2 shadow-sm shadow-black/5 sm:h-9';

// Web-specific styles for focus and validation states
const WEB_WRAPPER_STYLES = cn(
  'transition-[color,box-shadow]',
  'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
);

// Disabled state visual treatment
const DISABLED_WRAPPER_STYLES = 'opacity-50';
const WEB_DISABLED_WRAPPER_STYLES = 'cursor-not-allowed';

type SearchProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Callback when user presses Enter/Return */
  onSubmit?: (value: string) => void;
  /** Placeholder text (defaults to "Search...") */
  placeholder?: string;
  /** Disable the search input */
  disabled?: boolean;
  /** Mark as invalid for error states */
  invalid?: boolean;
  /** Constrain width using semantic tokens (matches Input) */
  width?: keyof typeof WIDTH_CLASSES;
  /** Hide the leading search icon */
  hideIcon?: boolean;
  /** Custom leading icon (defaults to Search/magnifying glass) */
  leadingIcon?: LucideIcon;
  /** Show loading spinner instead of clear button */
  loading?: boolean;
};

/**
 * A search input component for filtering and searching use cases.
 *
 * @ref Forwards a TextInput ref for focus management and value access.
 *
 * @remarks
 * - Supports both controlled and uncontrolled modes
 * - Shows clear button when value is present
 * - Optional loading state shows spinner
 * - Use `invalid` prop for error states
 * - Default placeholder is "Search..."
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Search placeholder="Search users..." onValueChange={setQuery} />
 *
 * // Controlled with submit
 * <Search
 *   value={searchQuery}
 *   onValueChange={setSearchQuery}
 *   onSubmit={handleSearch}
 * />
 *
 * // Loading while fetching
 * <Search value={query} onValueChange={setQuery} loading={isSearching} />
 * ```
 */
const Search = React.forwardRef<TextInput, SearchProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      onSubmit,
      placeholder = 'Search...',
      disabled = false,
      invalid = false,
      width,
      hideIcon = false,
      leadingIcon,
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');

    // Determine if controlled
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    // Track initial controlled state to warn about switching modes
    const wasControlledRef = React.useRef(isControlled);
    React.useEffect(() => {
      if (__DEV__) {
        if (wasControlledRef.current && !isControlled) {
          console.warn(
            'Search: A component is changing from controlled to uncontrolled. ' +
              'This is likely caused by the value changing from a defined value to undefined. ' +
              'Decide between using a controlled or uncontrolled Search element for the lifetime of the component.'
          );
        } else if (!wasControlledRef.current && isControlled) {
          console.warn(
            'Search: A component is changing from uncontrolled to controlled. ' +
              'This is likely caused by the value changing from undefined to a defined value. ' +
              'Decide between using a controlled or uncontrolled Search element for the lifetime of the component.'
          );
        }
      }
      wasControlledRef.current = isControlled;
    }, [isControlled]);

    const handleChange = React.useCallback(
      (text: string) => {
        if (!isControlled) {
          setInternalValue(text);
        }
        onValueChange?.(text);
      },
      [isControlled, onValueChange]
    );

    const handleClear = React.useCallback(() => {
      handleChange('');
    }, [handleChange]);

    const handleSubmitEditing = React.useCallback(() => {
      onSubmit?.(currentValue);
    }, [onSubmit, currentValue]);

    // Default to full width when no width prop is specified
    const widthClass = WIDTH_CLASSES[width ?? 'full'];
    const LeadingIcon = leadingIcon ?? SearchIcon;

    // Determine trailing element visibility
    const showClearButton = currentValue.length > 0 && !disabled && !loading;
    const showSpinner = loading;

    return (
      <View
        aria-invalid={invalid || undefined}
        accessibilityState={{ disabled }}
        className={cn(
          // Always apply dark class on native (app is dark mode only)
          Platform.OS !== 'web' && 'dark',
          BASE_WRAPPER_STYLES,
          widthClass,
          disabled &&
            cn(DISABLED_WRAPPER_STYLES, Platform.select({ web: WEB_DISABLED_WRAPPER_STYLES })),
          Platform.select({ web: WEB_WRAPPER_STYLES }),
          className
        )}
      >
        {/* Leading icon */}
        {!hideIcon && (
          <Icon
            as={LeadingIcon}
            size={16}
            className={cn(
              'shrink-0 text-muted-foreground',
              Platform.select({ web: 'pointer-events-none' })
            )}
          />
        )}

        {/* Text input */}
        <TextInput
          ref={ref}
          value={currentValue}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmitEditing}
          placeholder={placeholder}
          editable={!disabled}
          autoComplete="off"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="search"
          accessibilityRole="search"
          accessibilityState={{ disabled }}
          className={cn(
            'text-foreground flex-1 bg-transparent text-base outline-none md:text-sm',
            Platform.select({
              web: 'placeholder:text-muted-foreground',
              default: 'placeholder:text-muted-foreground/50',
            })
          )}
          {...props}
        />

        {/* Trailing element: clear button or spinner */}
        {showSpinner && <Spinner size={16} tone="muted" />}
        {showClearButton && (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            className={cn('rounded-sm opacity-70', Platform.select({ web: 'hover:opacity-100' }))}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Icon as={X} size={16} className="text-muted-foreground" />
          </Pressable>
        )}
      </View>
    );
  }
);

Search.displayName = 'Search';

export { Search };
export type { SearchProps };
