/**
 * Command - React Native command palette component
 *
 * A port of the popular cmdk library with API parity,
 * adapted for React Native (web first).
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Command>
 *   <CommandInput placeholder="Search..." />
 *   <CommandList>
 *     <CommandEmpty>No results found.</CommandEmpty>
 *     <CommandGroup heading="Actions">
 *       <CommandItem value="new-file" onSelect={() => {}}>New File</CommandItem>
 *       <CommandItem value="new-folder" onSelect={() => {}}>New Folder</CommandItem>
 *     </CommandGroup>
 *     <CommandSeparator />
 *     <CommandGroup heading="Settings">
 *       <CommandItem value="preferences" keywords={["prefs", "settings"]}>
 *         Preferences
 *       </CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 *
 * // Dialog usage
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandInput placeholder="Type a command..." />
 *   <CommandList>
 *     <CommandItem value="open" onSelect={() => setOpen(false)}>
 *       Open…
 *     </CommandItem>
 *   </CommandList>
 * </CommandDialog>
 * ```
 */

// Components
export { Command } from './command-root';
export { CommandDialog } from './command-dialog';
export { CommandEmpty } from './command-empty';
export { CommandGroup, CommandGroupHeading } from './command-group';
export { CommandInput } from './command-input';
export { CommandItem } from './command-item';
export { CommandList } from './command-list';
export { CommandLoading } from './command-loading';
export { CommandSeparator } from './command-separator';

// Hooks for advanced usage
export {
  useCommand,
  useCommandFilteredCount,
  useCommandGroup,
  useCommandItemSelected,
  useCommandItemVisible,
  useCommandListId,
  useCommandLoading,
  useCommandSearch,
  useCommandState,
  useCommandValue,
} from './command-context';

// Utilities for custom implementations
export { commandScore, SCORE } from './command-utils';
export { defaultFilter } from './command-store';

// Types
export type { CommandProps } from './command-root';
export type { CommandDialogProps } from './command-dialog';
export type { CommandEmptyProps } from './command-empty';
export type { CommandGroupProps } from './command-group';
export type { CommandInputProps } from './command-input';
export type { CommandItemProps } from './command-item';
export type { CommandListProps } from './command-list';
export type { CommandLoadingProps } from './command-loading';
export type { CommandSeparatorProps } from './command-separator';
export type { CommandState, CommandStoreOptions } from './command-store';
export type { CommandFilterFn } from './command-utils';
