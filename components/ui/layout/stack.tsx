import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
import { GAP_CLASSES, type SpacingToken } from './layout-constants';

const DIRECTION_CLASSES = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
} as const;

const ALIGN_CLASSES = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const;

const JUSTIFY_CLASSES = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const;

type StackProps = Omit<ViewProps, 'style' | 'className'> & {
  direction?: keyof typeof DIRECTION_CLASSES;
  gap?: SpacingToken;
  align?: keyof typeof ALIGN_CLASSES;
  justify?: keyof typeof JUSTIFY_CLASSES;
  wrap?: boolean;
};

/**
 * Stack - Arranges children in a row or column with consistent spacing
 *
 * Foundation for VStack and HStack. Not exported directly to avoid
 * conflicts with Expo Router's Stack. Use VStack or HStack instead.
 */
const Stack = React.memo(
  React.forwardRef<View, StackProps>(
    ({ direction = 'vertical', gap, align, justify, wrap, ...props }, ref) => {
      const debugStyle = useDebugStyle();

      return (
        <View
          ref={ref}
          className={cn(
            DIRECTION_CLASSES[direction],
            gap && GAP_CLASSES[gap],
            align && ALIGN_CLASSES[align],
            justify && JUSTIFY_CLASSES[justify],
            wrap && 'flex-wrap'
          )}
          style={debugStyle}
          {...props}
        />
      );
    }
  )
);
Stack.displayName = 'Stack';

type VStackProps = Omit<StackProps, 'direction'>;
type HStackProps = Omit<StackProps, 'direction'>;

/**
 * VStack - Arranges children in a vertical column
 *
 * @example
 * ```tsx
 * <VStack gap="md">
 *   <Text>First</Text>
 *   <Text>Second</Text>
 * </VStack>
 * ```
 */
const VStack = React.forwardRef<View, VStackProps>((props, ref) => (
  <Stack ref={ref} direction="vertical" {...props} />
));
VStack.displayName = 'VStack';

/**
 * HStack - Arranges children in a horizontal row
 *
 * @example
 * ```tsx
 * <HStack gap="sm" justify="between">
 *   <Text>Label</Text>
 *   <Switch />
 * </HStack>
 * ```
 */
const HStack = React.forwardRef<View, HStackProps>((props, ref) => (
  <Stack ref={ref} direction="horizontal" {...props} />
));
HStack.displayName = 'HStack';

export { VStack, HStack };
export type { VStackProps, HStackProps };
