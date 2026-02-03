import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, TextInput, type TextInputProps } from 'react-native';

// Base styles shared across all states
const BASE_STYLES =
  'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9';

// Web-specific styles for focus, selection, and validation states
const WEB_STYLES = cn(
  'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
  'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
);

// Native-specific placeholder styling
const NATIVE_STYLES = 'placeholder:text-muted-foreground/50';

// Disabled state visual treatment
const DISABLED_STYLES = 'opacity-50';
const WEB_DISABLED_STYLES = 'cursor-not-allowed';

const WIDTH_CLASSES = {
  xs: 'w-16',
  sm: 'w-24',
  md: 'w-32',
  lg: 'w-40',
  xl: 'w-48',
  full: 'w-full',
} as const;

type InputProps = TextInputProps & {
  /** Disable the input. Sets visual state and prevents interaction. */
  disabled?: boolean;
  /** Mark the input as invalid for error states. Maps to aria-invalid on web. */
  invalid?: boolean;
  /** Constrain the input width using semantic tokens. */
  width?: keyof typeof WIDTH_CLASSES;
};

/**
 * A text input component for form data entry.
 *
 * @ref Forwards a TextInput ref for focus management and value access.
 *
 * @remarks
 * - Supports both `disabled` prop and `editable={false}` for disabling
 * - Use `invalid` prop for error states (automatically sets aria-invalid)
 * - Web: Uses focus-visible ring and aria-invalid styles
 * - Native: Uses muted placeholder colors
 * - Pass `cursorColor` prop to customize cursor on native platforms
 */
const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, disabled, editable, invalid, width, ...props }, ref) => {
    // Support both disabled prop and editable={false} for disabling
    const isDisabled = disabled || editable === false;
    const widthClass = width ? WIDTH_CLASSES[width] : undefined;
    return (
      <TextInput
        ref={ref}
        editable={!isDisabled}
        aria-invalid={invalid}
        accessibilityState={{ disabled: isDisabled }}
        className={cn(
          // Always apply dark class on native (app is dark mode only)
          Platform.OS !== 'web' && 'dark',
          BASE_STYLES,
          widthClass,
          isDisabled &&
            cn(DISABLED_STYLES, Platform.select({ web: WEB_DISABLED_STYLES })),
          Platform.select({
            web: WEB_STYLES,
            native: NATIVE_STYLES,
          }),
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
