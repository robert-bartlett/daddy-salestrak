import * as React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
import { SPACING_SCALE, type SpacingToken } from './layout-constants';

type SpacerProps = Omit<ViewProps, 'className' | 'style'> & {
  size?: SpacingToken;
  direction?: 'horizontal' | 'vertical';
};

/**
 * Spacer - Creates empty space between elements
 *
 * Without a `size` prop, uses `flex-1` to fill available space (pushes siblings apart).
 * With a `size` prop, creates fixed spacing in the specified direction.
 *
 * @example
 * ```tsx
 * // Flexible spacer (pushes content apart)
 * <HStack>
 *   <Title />
 *   <Spacer />
 *   <Actions />
 * </HStack>
 *
 * // Fixed vertical space
 * <VStack>
 *   <Header />
 *   <Spacer size="lg" />
 *   <Content />
 * </VStack>
 * ```
 */
const Spacer = React.memo(
  React.forwardRef<View, SpacerProps>(
    ({ size, direction = 'vertical', ...props }, ref) => {
      const debugStyle = useDebugStyle();

      const style = React.useMemo<ViewStyle>(() => {
        if (!size) {
          return { flex: 1, ...debugStyle };
        }

        const length = SPACING_SCALE[size];
        return {
          ...(direction === 'horizontal'
            ? { width: length, flexShrink: 0 }
            : { height: length, flexShrink: 0 }),
          ...debugStyle,
        };
      }, [size, direction, debugStyle]);

      return <View ref={ref} style={style} {...props} />;
    }
  )
);
Spacer.displayName = 'Spacer';

export { Spacer };
export type { SpacerProps };
