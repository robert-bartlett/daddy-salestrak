import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
import {
  BACKGROUND_CLASSES,
  type BackgroundToken,
  type FillOption,
  GAP_CLASSES,
  getFillClass,
  MARGIN_CLASSES,
  MARGIN_X_CLASSES,
  MARGIN_Y_CLASSES,
  PADDING_CLASSES,
  PADDING_X_CLASSES,
  PADDING_Y_CLASSES,
  ROUNDED_CLASSES,
  SPACING_SCALE,
  type RoundedToken,
  type SpacingToken,
} from './layout-constants';

type BoxProps = Omit<ViewProps, 'className' | 'style'> & {
  padding?: SpacingToken;
  paddingX?: SpacingToken;
  paddingY?: SpacingToken;
  margin?: SpacingToken;
  marginX?: SpacingToken;
  marginY?: SpacingToken;
  gap?: SpacingToken;
  background?: BackgroundToken;
  rounded?: RoundedToken;
  fill?: FillOption;
  size?: SpacingToken | number;
};

/**
 * Box - A foundational layout primitive for containing and spacing content
 *
 * The most flexible layout component, providing padding, margin, gap,
 * background colors, and border radius through semantic props.
 *
 * @example
 * ```tsx
 * <Box padding="md" background="card" rounded="lg">
 *   <Text>Content in a card</Text>
 * </Box>
 * ```
 */
const Box = React.memo(
  React.forwardRef<View, BoxProps>(
    (
      {
        padding,
        paddingX,
        paddingY,
        margin,
        marginX,
        marginY,
        gap,
        background,
        rounded,
        fill,
        size,
        ...props
      },
      ref
    ) => {
      const debugStyle = useDebugStyle();
      const sizeValue =
        typeof size === 'number' ? size : size ? SPACING_SCALE[size] : undefined;

      const combinedStyle = React.useMemo<ViewStyle | undefined>(() => {
        if (!sizeValue && !debugStyle) return undefined;
        return {
          ...(sizeValue && { width: sizeValue, height: sizeValue }),
          ...debugStyle,
        };
      }, [sizeValue, debugStyle]);

      return (
        <View
          ref={ref}
          className={cn(
            getFillClass(fill),
            padding && PADDING_CLASSES[padding],
            paddingX && PADDING_X_CLASSES[paddingX],
            paddingY && PADDING_Y_CLASSES[paddingY],
            margin && MARGIN_CLASSES[margin],
            marginX && MARGIN_X_CLASSES[marginX],
            marginY && MARGIN_Y_CLASSES[marginY],
            gap && GAP_CLASSES[gap],
            background && BACKGROUND_CLASSES[background],
            rounded && ROUNDED_CLASSES[rounded]
          )}
          style={combinedStyle}
          {...props}
        />
      );
    }
  )
);
Box.displayName = 'Box';

export { Box };
export type { BoxProps };
