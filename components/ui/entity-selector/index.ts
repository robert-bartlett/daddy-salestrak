/**
 * EntitySelector - A config-driven, composable component for selecting entities
 *
 * Provides a popover-based multi-select interface with support for:
 * - Multiple entity pools (tabs)
 * - Search filtering
 * - Avatar, title, and description display
 * - Action buttons per item
 * - Pool-aware selection tracking
 *
 * @example
 * ```tsx
 * const config: EntitySelectorConfig = {
 *   pools: [
 *     {
 *       id: 'members',
 *       label: 'Members',
 *       icon: Users,
 *       itemBadge: { label: 'Profile' },
 *       items: members,
 *     },
 *     {
 *       id: 'teams',
 *       label: 'Teams',
 *       icon: UsersRound,
 *       itemBadge: { label: 'Team' },
 *       items: teams,
 *     },
 *   ],
 *   searchPlaceholder: 'Set assignees...',
 * };
 *
 * <EntitySelector config={config} value={selections} onValueChange={setSelections}>
 *   <EntitySelectorTrigger placeholder="Set assignees..." />
 *   <EntitySelectorContent>
 *     <EntitySelectorAutoTabs />
 *     <EntitySelectorInput />
 *     <EntitySelectorSelected label="Assignees" hideWhenEmpty />
 *     <EntitySelectorPool value="members" />
 *     <EntitySelectorPool value="teams" />
 *     <EntitySelectorEmpty>No results found</EntitySelectorEmpty>
 *     <EntitySelectorFooter>
 *       <Button variant="ghost" onPress={handleInvite}>
 *         <Icon as={UserPlus} />
 *         <Text>Invite members via email</Text>
 *       </Button>
 *     </EntitySelectorFooter>
 *   </EntitySelectorContent>
 * </EntitySelector>
 * ```
 */

// Main components
export { EntitySelectorRoot as EntitySelector } from './entity-selector-root';
export { EntitySelectorTrigger } from './entity-selector-trigger';
export { EntitySelectorContent } from './entity-selector-content';
export { EntitySelectorInput } from './entity-selector-input';
export {
  EntitySelectorTabs,
  EntitySelectorTabsList,
  EntitySelectorTabsTrigger,
  EntitySelectorAutoTabs,
} from './entity-selector-tabs';
export { EntitySelectorSelected } from './entity-selector-selected';
export { EntitySelectorPool } from './entity-selector-pool';
export { EntitySelectorItem } from './entity-selector-item';
export { EntitySelectorEmpty } from './entity-selector-empty';
export { EntitySelectorFooter } from './entity-selector-footer';

// Hooks for advanced usage
export {
  useEntitySelector,
  useEntitySelectorSelected,
  useEntitySelectorSelections,
  useEntitySelectorActivePool,
  useEntitySelectorSearch,
  useEntitySelectorOpen,
  useEntitySelectorHighlightedId,
  useEntitySelectorIsHighlighted,
  useEntitySelectorHighlight,
} from './entity-selector-context';

// Types
export type { EntitySelectorRootProps } from './entity-selector-root';
export type { EntitySelectorTriggerProps } from './entity-selector-trigger';
export type { EntitySelectorContentProps } from './entity-selector-content';
export type { EntitySelectorInputProps } from './entity-selector-input';
export type {
  EntitySelectorTabsProps,
  EntitySelectorTabsListProps,
  EntitySelectorTabsTriggerProps,
  EntitySelectorAutoTabsProps,
} from './entity-selector-tabs';
export type { EntitySelectorSelectedProps } from './entity-selector-selected';
export type { EntitySelectorPoolProps } from './entity-selector-pool';
export type { EntitySelectorItemProps } from './entity-selector-item';
export type { EntitySelectorEmptyProps } from './entity-selector-empty';
export type { EntitySelectorFooterProps } from './entity-selector-footer';

// Config types
export type {
  EntityItemConfig,
  EntityAvatarConfig,
  EntityBadgeConfig,
  EntityPoolConfig,
  EntitySelectorConfig,
  EntitySelection,
  EntitySelectorContextValue,
} from './entity-selector-context';
