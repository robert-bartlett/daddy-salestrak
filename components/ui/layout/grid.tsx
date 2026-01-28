import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
import { GAP_CLASSES, SPACING_SCALE, type SpacingToken } from './layout-constants';

const GRID_COLUMNS_CLASS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

type GridProps = Omit<ViewProps, 'className' | 'style'> & {
  columns?: number;
  gap?: SpacingToken;
};

/**
 * Grid - Grid layout with responsive columns
 *
 * Platform behavior:
 * - Web: Uses CSS Grid for true grid layout
 * - Native: Uses flex-wrap fallback (children wrapped in cell Views with calculated flexBasis)
 *
 * @example
 * ```tsx
 * <Grid columns={3} gap="md">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * ```
 */
const Grid = React.memo(
  React.forwardRef<View, GridProps>(({ columns = 1, gap, children, ...props }, ref) => {
    const debugStyle = useDebugStyle();
    const clampedColumns = Math.min(Math.max(columns, 1), 12);

    // Web: Use native CSS Grid
    if (Platform.OS === 'web') {
      return (
        <View
          ref={ref}
          className={cn('grid', GRID_COLUMNS_CLASS[clampedColumns], gap && GAP_CLASSES[gap])}
          style={debugStyle}
          {...props}>
          {children}
        </View>
      );
    }

    // Native: flex-wrap with padding on cells + negative margin on container
    const gapValue = gap ? SPACING_SCALE[gap] : 0;
    const halfGap = gapValue / 2;

    const containerStyle = React.useMemo<ViewStyle>(() => ({
      ...(gapValue > 0 && { margin: -halfGap }),
      ...debugStyle,
    }), [gapValue, debugStyle]);

    const cellStyle = React.useMemo<ViewStyle>(() => {
      const basisPercent = 100 / clampedColumns;
      const basis = `${basisPercent}%` as `${number}%`;
      return {
        flexBasis: basis,
        maxWidth: basis,
        padding: halfGap,
      };
    }, [clampedColumns, halfGap]);

    return (
      <View ref={ref} className="flex-row flex-wrap" style={containerStyle} {...props}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          return (
            <View key={child.key ?? index} style={cellStyle}>
              {child}
            </View>
          );
        })}
      </View>
    );
  })
);
Grid.displayName = 'Grid';

export { Grid };
export type { GridProps };
