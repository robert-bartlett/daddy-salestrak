import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
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

type StackProps = Omit<ViewProps, 'className' | 'style'> & {
  direction?: keyof typeof DIRECTION_CLASSES;
  gap?: SpacingToken;
  align?: keyof typeof ALIGN_CLASSES;
  justify?: keyof typeof JUSTIFY_CLASSES;
  wrap?: boolean;
};

const Stack = React.forwardRef<View, StackProps>(
  ({ direction = 'vertical', gap, align, justify, wrap, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          DIRECTION_CLASSES[direction],
          gap ? GAP_CLASSES[gap] : undefined,
          align ? ALIGN_CLASSES[align] : undefined,
          justify ? JUSTIFY_CLASSES[justify] : undefined,
          wrap ? 'flex-wrap' : undefined
        )}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack';

type VStackProps = Omit<StackProps, 'direction'>;

type HStackProps = Omit<StackProps, 'direction'>;

const VStack = React.forwardRef<View, VStackProps>((props, ref) => (
  <Stack ref={ref} direction="vertical" {...props} />
));

VStack.displayName = 'VStack';

const HStack = React.forwardRef<View, HStackProps>((props, ref) => (
  <Stack ref={ref} direction="horizontal" {...props} />
));

HStack.displayName = 'HStack';

// Note: Stack is intentionally NOT exported to avoid conflicts with Expo Router's Stack.
// Use VStack (vertical) or HStack (horizontal) instead.
export { VStack, HStack };
export type { VStackProps, HStackProps };
