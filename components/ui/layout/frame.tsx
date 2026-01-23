import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

const DIRECTION_CLASSES = {
  row: 'flex-row',
  column: 'flex-col',
} as const;

type FrameFill = true | 'width' | 'height' | 'both';

type FrameProps = Omit<ViewProps, 'className' | 'style'> & {
  fill?: FrameFill;
  direction?: keyof typeof DIRECTION_CLASSES;
  shrink?: boolean;
};

const Frame = React.forwardRef<View, FrameProps>(
  ({ fill, direction = 'column', shrink, ...props }, ref) => {
    const fillClass =
      fill === true || fill === 'both'
        ? 'flex-1 w-full h-full'
        : fill === 'width'
        ? 'w-full'
        : fill === 'height'
        ? 'h-full'
        : undefined;

    return (
      <View
        ref={ref}
        className={cn(
          DIRECTION_CLASSES[direction],
          fillClass,
          shrink ? 'shrink' : undefined
        )}
        {...props}
      />
    );
  }
);

Frame.displayName = 'Frame';

export { Frame };
export type { FrameProps, FrameFill };
