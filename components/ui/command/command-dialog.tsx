/**
 * Command Dialog - Modal wrapper for the command palette
 *
 * Combines the Command component with the Dialog component
 * for a modal command palette experience (Cmd+K style).
 */

import {
  Dialog,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import * as DialogPrimitive from '@rn-primitives/dialog';
import * as React from 'react';
import { Platform } from 'react-native';
import { Command, type CommandProps } from './command-root';

export type CommandDialogProps = DialogPrimitive.RootProps &
  Pick<DialogContentProps, 'portalHost'> &
  Pick<CommandProps, 'filter' | 'shouldFilter' | 'loop' | 'label'> & {
    /** Accessibility title for the dialog (visually hidden) */
    title?: string;
    /** Custom className for the dialog content */
    contentClassName?: string;
    /** Custom className for the command root */
    commandClassName?: string;
    /** Children (CommandInput, CommandList, etc.) */
    children?: React.ReactNode;
  };

/**
 * CommandDialog - Modal command palette.
 *
 * @remarks
 * - Wraps Command in a Dialog for modal presentation
 * - Supports Escape to close
 * - Inherits all Command props (filter, shouldFilter, loop, label)
 * - Uses Dialog's open/onOpenChange for state management
 *
 * @example
 * ```tsx
 * const [open, setOpen] = React.useState(false);
 *
 * // Open with Cmd+K
 * React.useEffect(() => {
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
 *       e.preventDefault();
 *       setOpen(true);
 *     }
 *   };
 *   window.addEventListener('keydown', handleKeyDown);
 *   return () => window.removeEventListener('keydown', handleKeyDown);
 * }, []);
 *
 * return (
 *   <CommandDialog open={open} onOpenChange={setOpen}>
 *     <CommandInput placeholder="Type a command..." />
 *     <CommandList>
 *       <CommandItem value="settings" onSelect={() => setOpen(false)}>
 *         Settings
 *       </CommandItem>
 *     </CommandList>
 *   </CommandDialog>
 * );
 * ```
 */
function CommandDialog({
  open,
  onOpenChange,
  portalHost,
  filter,
  shouldFilter,
  loop,
  label,
  title = 'Command menu',
  contentClassName,
  commandClassName,
  children,
  ...props
}: CommandDialogProps) {
  // Handle Escape key to close dialog (in addition to Dialog's built-in handling)
  React.useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        portalHost={portalHost}
        showCloseButton={false}
        // Anchor to top with padding (like Spotlight/VS Code) so it doesn't jump when filtering
        // justify-start aligns to top (RN flex defaults to column, so main-axis is vertical)
        overlayClassName={Platform.OS === 'web' ? 'justify-start pt-[15vh]' : undefined}
        // Reset dialog padding/gap for clean command palette appearance
        // Set explicit width for command palette (max-w alone doesn't expand the dialog)
        className={`w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:w-[640px] ${contentClassName ?? ''}`}
      >{[
        <DialogTitle key="title" className="sr-only"><Text className="sr-only">{title}</Text></DialogTitle>,
        <DialogDescription key="desc" className="sr-only"><Text className="sr-only">Search for commands and actions</Text></DialogDescription>,
        <Command
          key="command"
          filter={filter}
          shouldFilter={shouldFilter}
          loop={loop}
          label={label}
          className={commandClassName}
        >{children}</Command>,
      ]}</DialogContent>
    </Dialog>
  );
}

CommandDialog.displayName = 'CommandDialog';

export { CommandDialog };
