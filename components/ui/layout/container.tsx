import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import {
  CONTAINER_MAX_WIDTH,
  type ContainerSize,
  PADDING_CLASSES,
  PADDING_X_CLASSES,
  PADDING_Y_CLASSES,
  type SpacingToken,
} from './layout-constants';

const CONTAINER_WEB_CLASSES: Record<Exclude<ContainerSize, 'full'>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

type ContainerProps = Omit<ViewProps, 'className' | 'style'> & {
  size?: ContainerSize;
  padding?: SpacingToken;
  paddingX?: SpacingToken;
  paddingY?: SpacingToken;
};

const Container = React.forwardRef<View, ContainerProps>(
  ({ size = 'lg', padding, paddingX, paddingY, ...props }, ref) => {
    const maxWidth = size === 'full' ? undefined : CONTAINER_MAX_WIDTH[size];

    return (
      <View
        ref={ref}
        className={cn(
          Platform.select({ web: 'mx-auto w-full' }),
          size !== 'full' && Platform.select({ web: CONTAINER_WEB_CLASSES[size] }),
          padding ? PADDING_CLASSES[padding] : undefined,
          paddingX ? PADDING_X_CLASSES[paddingX] : undefined,
          paddingY ? PADDING_Y_CLASSES[paddingY] : undefined
        )}
        style={
          Platform.select({
            native: {
              width: '100%',
              alignSelf: 'center',
              maxWidth,
            },
          })
        }
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

export { Container };
export type { ContainerProps };
