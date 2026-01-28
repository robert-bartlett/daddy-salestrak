/**
 * EntitySelector Content - Popover content wrapper
 *
 * Renders the popover content container.
 * Handles animations and portal rendering.
 */

import { PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { EntitySelectorContext, useEntitySelector } from './entity-selector-context';
import {
  EntitySelectorHighlightContext,
  useEntitySelectorHighlight,
} from './entity-selector-highlight-context';

const DEFAULT_MAX_HEIGHT = 400;

export type EntitySelectorContentProps = {
  /** Popover side positioning */
  side?: 'top' | 'bottom';
  /** Popover alignment */
  align?: 'start' | 'center' | 'end';
  /** Offset from trigger */
  sideOffset?: number;
  /** Portal host name */
  portalHost?: string;
  /** Maximum height of the content area (default: 400) */
  maxHeight?: number;
  /** Children components */
  children: React.ReactNode;
};

/**
 * EntitySelectorContent - Dropdown container for the entity selector.
 *
 * @remarks
 * - Wraps PopoverContent for positioning/animations
 * - Contains search input, tabs, and pools
 *
 * @example
 * ```tsx
 * <EntitySelectorContent>
 *   <EntitySelectorInput />
 *   <EntitySelectorTabs>...</EntitySelectorTabs>
 *   <EntitySelectorSelected />
 *   <EntitySelectorPool value="members" />
 *   <EntitySelectorFooter>...</EntitySelectorFooter>
 * </EntitySelectorContent>
 * ```
 */
const EntitySelectorContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  EntitySelectorContentProps
>(
  (
    {
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      portalHost,
      maxHeight = DEFAULT_MAX_HEIGHT,
      children,
    },
    ref
  ) => {
    // Consume contexts before the portal so we can re-provide them inside.
    // Portal renders content in a separate React tree on native, breaking context.
    const selectorContext = useEntitySelector();
    const highlightContext = useEntitySelectorHighlight();

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
            web: 'w-[var(--radix-popover-trigger-width)] min-w-[320px]',
            native: 'w-full min-w-[320px]',
          })
        )}
      >
        <EntitySelectorContext.Provider value={selectorContext}>
          <EntitySelectorHighlightContext.Provider value={highlightContext}>
            {Platform.OS === 'web' ? (
              <div
                className="flex flex-col overflow-hidden"
                style={{ maxHeight }}
              >
                <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
                  {children}
                </div>
              </div>
            ) : (
              <View style={{ maxHeight }} className="flex flex-col overflow-hidden">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              </View>
            )}
          </EntitySelectorHighlightContext.Provider>
        </EntitySelectorContext.Provider>
      </PopoverContent>
    );
  }
);

EntitySelectorContent.displayName = 'EntitySelectorContent';

export { EntitySelectorContent };
