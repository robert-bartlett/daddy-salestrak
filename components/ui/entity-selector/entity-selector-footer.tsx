/**
 * EntitySelector Footer - Container for action buttons
 *
 * A simple container at the bottom of the content for additional actions.
 */

import * as React from 'react';
import { View } from 'react-native';

export type EntitySelectorFooterProps = {
  /** Children (action buttons, links, etc.) */
  children: React.ReactNode;
};

/**
 * EntitySelectorFooter - Container for footer actions.
 *
 * @remarks
 * - Uses existing Button, Icon, Text components
 * - Provides consistent padding and border styling
 *
 * @example
 * ```tsx
 * <EntitySelectorFooter>
 *   <Button variant="ghost" onPress={handleInvite}>
 *     <Icon as={UserPlus} />
 *     <Text>Invite members via email</Text>
 *   </Button>
 * </EntitySelectorFooter>
 * ```
 */
const EntitySelectorFooter = React.forwardRef<View, EntitySelectorFooterProps>(
  ({ children }, ref) => {
    return (
      <View ref={ref} className="border-t border-border p-1">
        {children}
      </View>
    );
  }
);

EntitySelectorFooter.displayName = 'EntitySelectorFooter';

export { EntitySelectorFooter };
