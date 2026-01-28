import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
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

/**
 * Container - A centered, max-width constrained wrapper
 *
 * Centers content and constrains it to a maximum width for readable layouts.
 *
 * Platform behavior:
 * - Web: Uses Tailwind max-width classes
 * - Native: Uses inline styles for maxWidth
 *
 * @example
 * ```tsx
 * <Container size="lg" paddingX="md">
 *   <Text>Centered content with max-width</Text>
 * </Container>
 * ```
 */
const Container = React.memo(
  React.forwardRef<View, ContainerProps>(
    ({ size = 'lg', padding, paddingX, paddingY, ...props }, ref) => {
      const debugStyle = useDebugStyle();
      const maxWidth = size === 'full' ? undefined : CONTAINER_MAX_WIDTH[size];

      const combinedStyle = React.useMemo<ViewStyle | undefined>(() => {
        if (Platform.OS === 'web' && !debugStyle) return undefined;

        return {
          ...(Platform.OS !== 'web' && {
            width: '100%',
            alignSelf: 'center',
            maxWidth,
          }),
          ...debugStyle,
        };
      }, [maxWidth, debugStyle]);

      return (
        <View
          ref={ref}
          className={cn(
            Platform.OS === 'web' && 'mx-auto w-full',
            Platform.OS === 'web' && size !== 'full' && CONTAINER_WEB_CLASSES[size],
            padding && PADDING_CLASSES[padding],
            paddingX && PADDING_X_CLASSES[paddingX],
            paddingY && PADDING_Y_CLASSES[paddingY]
          )}
          style={combinedStyle}
          {...props}
        />
      );
    }
  )
);
Container.displayName = 'Container';

export { Container };
export type { ContainerProps };
