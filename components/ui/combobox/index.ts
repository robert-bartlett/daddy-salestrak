/**
 * Combobox - A shadcn-style combobox component combining Popover + Command
 *
 * Supports both single-select and multi-select modes with search filtering.
 *
 * @example
 * ```tsx
 * // Single-select
 * <Combobox value={value} onValueChange={setValue}>
 *   <ComboboxTrigger placeholder="Select framework..." />
 *   <ComboboxContent>
 *     <ComboboxInput placeholder="Search..." />
 *     <ComboboxList>
 *       <ComboboxEmpty>No results found.</ComboboxEmpty>
 *       <ComboboxItem value="react">React</ComboboxItem>
 *       <ComboboxItem value="vue">Vue</ComboboxItem>
 *       <ComboboxItem value="angular">Angular</ComboboxItem>
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 *
 * // Multi-select
 * <Combobox values={values} onValuesChange={setValues} multiple>
 *   <ComboboxTrigger placeholder="Select tags..." displayMode="count" />
 *   <ComboboxContent closeOnSelect={false}>
 *     <ComboboxInput placeholder="Search tags..." />
 *     <ComboboxList>
 *       <ComboboxEmpty>No tags found.</ComboboxEmpty>
 *       <ComboboxItem value="bug">Bug</ComboboxItem>
 *       <ComboboxItem value="feature">Feature</ComboboxItem>
 *       <ComboboxItem value="enhancement">Enhancement</ComboboxItem>
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 *
 * // With groups
 * <Combobox value={value} onValueChange={setValue}>
 *   <ComboboxTrigger placeholder="Select..." />
 *   <ComboboxContent>
 *     <ComboboxInput />
 *     <ComboboxList>
 *       <ComboboxGroup heading="Frontend">
 *         <ComboboxItem value="react">React</ComboboxItem>
 *         <ComboboxItem value="vue">Vue</ComboboxItem>
 *       </ComboboxGroup>
 *       <ComboboxSeparator />
 *       <ComboboxGroup heading="Backend">
 *         <ComboboxItem value="node">Node.js</ComboboxItem>
 *         <ComboboxItem value="python">Python</ComboboxItem>
 *       </ComboboxGroup>
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 * ```
 */

// Components
export { ComboboxRoot as Combobox } from './combobox-root';
export { ComboboxContent } from './combobox-content';
export { ComboboxEmpty } from './combobox-empty';
export { ComboboxGroup } from './combobox-group';
export { ComboboxInput } from './combobox-input';
export { ComboboxItem } from './combobox-item';
export { ComboboxList } from './combobox-list';
export { ComboboxSeparator } from './combobox-separator';
export { ComboboxTrigger } from './combobox-trigger';

// Hooks for advanced usage
export {
  useCombobox,
  useComboboxMultiple,
  useComboboxOpen,
  useComboboxSelected,
} from './combobox-context';

// Types
export type { ComboboxRootProps } from './combobox-root';
export type { ComboboxContentProps } from './combobox-content';
export type { ComboboxEmptyProps } from './combobox-empty';
export type { ComboboxGroupProps } from './combobox-group';
export type { ComboboxInputProps } from './combobox-input';
export type { ComboboxItemProps } from './combobox-item';
export type { ComboboxListProps } from './combobox-list';
export type { ComboboxSeparatorProps } from './combobox-separator';
export type { ComboboxTriggerProps } from './combobox-trigger';
export type { ComboboxContextValue } from './combobox-context';
