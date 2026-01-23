/**
 * Combobox Content - Dropdown container wrapping Popover and Command
 *
 * Renders the popover content with Command palette functionality.
 * Handles animations, portal rendering, and text color context.
 */

import { Command } from '@/components/ui/command';
import { PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform } from 'react-native';
import { ComboboxProvider, useCombobox } from './combobox-context';

export type ComboboxContentProps = {
  /** Override close behavior on item select */
  closeOnSelect?: boolean;
  /** Popover side positioning */
  side?: 'top' | 'bottom';
  /** Popover alignment */
  align?: 'start' | 'center' | 'end';
  /** Offset from trigger */
  sideOffset?: number;
  /** Portal host name for custom portal targeting */
  portalHost?: string;
  /** Additional className */
  className?: string;
  /** Children (ComboboxInput, ComboboxList, etc.) */
  children: React.ReactNode;
};

/**
 * ComboboxContent - Dropdown container for the combobox.
 *
 * @remarks
 * - Wraps PopoverContent for positioning/animations
 * - Wraps Command for search/keyboard navigation
 * - Provides updated closeOnSelect to context
 * - Matches width to trigger element (container-controlled)
 *
 * @example
 * ```tsx
 * <ComboboxContent>
 *   <ComboboxInput placeholder="Search..." />
 *   <ComboboxList>
 *     <ComboboxItem value="opt1">Option 1</ComboboxItem>
 *   </ComboboxList>
 * </ComboboxContent>
 *
 * // Multi-select with closeOnSelect override
 * <ComboboxContent closeOnSelect={false}>
 *   ...
 * </ComboboxContent>
 * ```
 */
const ComboboxContent = React.forwardRef<React.ElementRef<typeof PopoverContent>, ComboboxContentProps>(
  (
    {
      closeOnSelect: closeOnSelectProp,
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      portalHost,
      className,
      children,
    },
    ref
  ) => {
    const parentContext = useCombobox();

    // Determine closeOnSelect: prop > default based on mode
    const closeOnSelect = closeOnSelectProp ?? !parentContext.multiple;

    // Create updated context with closeOnSelect override
    const updatedContext = React.useMemo(
      () => ({
        ...parentContext,
        closeOnSelect,
      }),
      [parentContext, closeOnSelect]
    );

    return (
      <PopoverContent
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        portalHost={portalHost}
        className={cn(
          'p-0',
          Platform.select({
            web: 'w-[var(--radix-popover-trigger-width)]',
            native: 'w-full',
          }),
          className
        )}
      >
        <ComboboxProvider value={updatedContext}>
          <Command className="bg-transparent">
            {children}
          </Command>
        </ComboboxProvider>
      </PopoverContent>
    );
  }
);

ComboboxContent.displayName = 'ComboboxContent';

export { ComboboxContent };
