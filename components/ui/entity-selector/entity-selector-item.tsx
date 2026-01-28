/**
 * EntitySelector Item - Entity row with avatar, title, checkbox, and action
 *
 * Renders a single entity item with:
 * - Checkbox for selection
 * - Avatar (image, fallback text, or icon)
 * - Title and description
 * - Optional action button
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react-native';
import * as React from 'react';
import { type GestureResponderEvent, Platform, Pressable, View } from 'react-native';
import {
  useEntitySelector,
  useEntitySelectorIsHighlighted,
  type EntityItemConfig,
} from './entity-selector-context';

export type EntitySelectorItemProps = {
  /** Entity configuration */
  entity: EntityItemConfig;
  /** Pool ID this item belongs to */
  poolId: string;
  /** Callback when action button is pressed */
  onAction?: (entity: EntityItemConfig) => void;
  /** Label for the action button (e.g., "Profile", "Team") */
  actionLabel?: string;
  /** Whether to show the checkbox */
  showCheckbox?: boolean;
};

/**
 * EntitySelectorItem - Renders a single entity row.
 *
 * @remarks
 * - Full row is clickable to toggle selection
 * - Shows checkbox, avatar, title/description, and optional action
 * - Avatar supports image, fallback text, or icon
 * - Action button (if provided) calls onAction callback
 *
 * @example
 * ```tsx
 * <EntitySelectorItem
 *   entity={member}
 *   poolId="members"
 *   actionLabel="Profile"
 *   onAction={(entity) => openProfile(entity.id)}
 * />
 * ```
 */
const EntitySelectorItemInner = React.forwardRef<View, EntitySelectorItemProps>(
  ({ entity, poolId, onAction, actionLabel, showCheckbox = true }, ref) => {
    const { toggleSelection, isSelected } = useEntitySelector();
    const selected = isSelected(entity.id);
    const highlighted = useEntitySelectorIsHighlighted(entity.id);
    const disabled = entity.disabled ?? false;

    // Handle row press (toggle selection)
    const handlePress = React.useCallback(() => {
      if (disabled) return;
      toggleSelection(entity, poolId);
    }, [disabled, entity, poolId, toggleSelection]);

    // Handle action button press (prevent propagation to row)
    const handleAction = React.useCallback(
      (event: GestureResponderEvent) => {
        event.stopPropagation?.();
        onAction?.(entity);
      },
      [entity, onAction]
    );

    // Generate avatar fallback from title
    const avatarFallback = React.useMemo(() => {
      if (entity.avatar?.fallback) return entity.avatar.fallback;
      // Generate initials from title
      const words = entity.title.split(' ').filter((w) => w.length > 0);
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return entity.title.trim().slice(0, 2).toUpperCase() || '??';
    }, [entity.avatar?.fallback, entity.title]);

    const AvatarIcon = entity.avatar?.icon ?? User;

    // Web-specific props for accessibility and scroll-into-view
    // - tabIndex: -1 prevents items from stealing focus (ARIA combobox pattern requires
    //   focus to stay on input, with aria-activedescendant indicating the active option)
    // - role/aria-selected: proper listbox semantics
    // - data-entity-id: used for scroll-into-view on keyboard navigation
    const webProps =
      Platform.OS === 'web'
        ? ({
            id: `entity-item-${entity.id}`,
            tabIndex: -1,
            role: 'option',
            'aria-selected': selected,
            'data-entity-id': entity.id,
          } as Record<string, unknown>)
        : {};

    // Native-specific accessibility props for screen readers
    const nativeA11yProps =
      Platform.OS !== 'web'
        ? {
            accessibilityLabel: `${entity.title}${entity.description ? `, ${entity.description}` : ''}`,
            accessibilityHint: selected ? 'Double tap to deselect' : 'Double tap to select',
          }
        : {};

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled }}
        className={cn(
          'group flex flex-row items-center gap-3 rounded-md px-2 py-1.5',
          Platform.select({
            web: 'cursor-default hover:bg-accent/30',
          }),
          // Keyboard highlight takes precedence over selection styling
          highlighted && 'bg-accent',
          // Selection styling (only when not highlighted to avoid double-bg)
          selected && !highlighted && 'bg-accent/50',
          disabled && 'opacity-50'
        )}
        {...webProps}
        {...nativeA11yProps}>
        {/* Checkbox - visual indicator only, row press handles toggle */}
        {showCheckbox && (
          <View
            // Prevent checkbox from stealing focus or capturing clicks on web
            // The row's onPress handles the toggle interaction
            {...(Platform.OS === 'web'
              ? ({ style: { pointerEvents: 'none' } } as Record<string, unknown>)
              : {})}>
            <Checkbox
              checked={selected}
              onCheckedChange={() => toggleSelection(entity, poolId)}
              disabled={disabled}
              haptics={false}
            />
          </View>
        )}

        {/* Avatar */}
        <Avatar size="sm" alt={entity.title}>
          {entity.avatar?.src ? <AvatarImage source={{ uri: entity.avatar.src }} /> : null}
          <AvatarFallback
            style={entity.avatar?.color ? { backgroundColor: entity.avatar.color } : undefined}
          >
            {entity.avatar?.icon ? (
              <Icon as={AvatarIcon} size={14} className="text-muted-foreground" />
            ) : (
              <Text className="text-xs font-medium text-muted-foreground">{avatarFallback}</Text>
            )}
          </AvatarFallback>
        </Avatar>

        {/* Title and Description */}
        <View className="min-w-0 flex-1 flex-row items-baseline gap-2">
          <Text className="truncate text-sm font-medium" numberOfLines={1}>
            {entity.title}
          </Text>
          {entity.description && (
            <Text className="truncate text-xs text-muted-foreground" numberOfLines={1}>
              {entity.description}
            </Text>
          )}
        </View>

        {/* Action Button - non-focusable to maintain combobox pattern */}
        {actionLabel && onAction && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleAction}
            className={cn('h-7 px-2', Platform.OS === 'web' && 'opacity-0 group-hover:opacity-100')}
            {...(Platform.OS === 'web' ? ({ tabIndex: -1 } as Record<string, unknown>) : {})}>
            <Text className="text-xs">{actionLabel}</Text>
          </Button>
        )}
      </Pressable>
    );
  }
);

EntitySelectorItemInner.displayName = 'EntitySelectorItemInner';

const EntitySelectorItem = React.memo(EntitySelectorItemInner, (prev, next) => {
  return (
    prev.entity.id === next.entity.id &&
    prev.poolId === next.poolId &&
    prev.actionLabel === next.actionLabel &&
    prev.showCheckbox === next.showCheckbox &&
    prev.onAction === next.onAction
  );
});

EntitySelectorItem.displayName = 'EntitySelectorItem';

export { EntitySelectorItem };
