import * as React from 'react';
import { cn } from '@/lib/utils';
import { Platform, TextInput, type TextInputProps } from 'react-native';

// Extract focus/blur event types from TextInputProps
type FocusEvent = Parameters<NonNullable<TextInputProps['onFocus']>>[0];
type BlurEvent = Parameters<NonNullable<TextInputProps['onBlur']>>[0];

// Default number of lines for textarea
// Web: controls initial height via field-sizing-content
// Native: controls maximum scrollable height
const DEFAULT_NUM_LINES_WEB = 2;
const DEFAULT_NUM_LINES_NATIVE = 8;

type TextareaProps = TextInputProps & {
  /** Mark the textarea as invalid for error states. Maps to aria-invalid on web. */
  invalid?: boolean;
  /**
   * @deprecated Use `invalid` instead for consistency with Input component.
   * Whether the textarea is in an error state.
   */
  error?: boolean;
};

/**
 * A multi-line text input component.
 *
 * @ref Forwards a TextInput ref.
 *
 * @remarks
 * - On web, numberOfLines determines initial height with auto-resize via field-sizing-content
 * - On native, numberOfLines determines maximum visible height before scrolling
 * - Supports error prop for validation state styling
 */
const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      className,
      multiline = true,
      numberOfLines = Platform.select({
        web: DEFAULT_NUM_LINES_WEB,
        default: DEFAULT_NUM_LINES_NATIVE,
      }),
      placeholderClassName,
      invalid,
      error,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Support both `invalid` (preferred) and `error` (deprecated) for backward compatibility
    const isInvalid = invalid ?? error;
    // Track focus state for native platforms (web uses CSS :focus-visible)
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = React.useCallback(
      (e: FocusEvent) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = React.useCallback(
      (e: BlurEvent) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    return (
      <TextInput
        ref={ref}
        className={cn(
          // Base styles
          'text-foreground border-input dark:bg-input/30 flex min-h-16 w-full flex-row rounded-md border bg-transparent px-3 py-2 text-base shadow-sm shadow-black/5 md:text-sm',
          // Platform-specific styles
          Platform.select({
            web: 'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive field-sizing-content resize-y outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:pointer-events-none',
            native: isFocused && 'border-ring',
          }),
          // Invalid/error state
          isInvalid && 'border-destructive',
          // Disabled state
          props.editable === false && 'opacity-50',
          className
        )}
        placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
