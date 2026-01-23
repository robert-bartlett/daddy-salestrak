import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';
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
  /**
   * Additional className applied to each grid cell wrapper (native only).
   * Use this to customize cell styling if the default wrapper affects your layout.
   */
  cellClassName?: string;
};

/**
 * Grid layout component with responsive columns.
 *
 * ## Platform Differences
 *
 * **Web**: Uses CSS Grid for true grid layout with perfect gap handling.
 *
 * **Native (iOS/Android)**: Uses flex-wrap fallback since React Native doesn't
 * support CSS Grid. Each child is wrapped in a View with calculated flexBasis.
 *
 * ### Native Limitations
 * - Children are wrapped in a cell View, which may affect styling that depends
 *   on being a direct child (use `cellClassName` to customize the wrapper)
 * - Gap is simulated using padding on cells with negative margins on container,
 *   which provides consistent spacing but differs slightly from CSS Grid
 * - For pixel-perfect layouts, test on both platforms
 */
const Grid = React.forwardRef<View, GridProps>(
  ({ columns = 1, gap, cellClassName, children, ...props }, ref) => {
    const clampedColumns = Math.min(Math.max(columns, 1), 12);
    const gapClass = gap ? GAP_CLASSES[gap] : undefined;

    // Web: Use native CSS Grid
    if (Platform.OS === 'web') {
      return (
        <View
          ref={ref}
          className={cn('grid', GRID_COLUMNS_CLASS[clampedColumns], gapClass)}
          {...props}>
          {children}
        </View>
      );
    }

    // Native: Use flex-wrap with margin-based spacing for consistent behavior
    // We use padding on cells + negative margin on container to simulate gap
    // This avoids edge-case spacing issues that can occur with gap + flex-wrap
    const gapValue = gap ? SPACING_SCALE[gap] : 0;
    const halfGap = gapValue / 2;
    const basisPercent = 100 / clampedColumns;
    const basis = `${basisPercent}%` as const;

    // Container style: negative margin to offset cell padding at edges
    const containerStyle: ViewStyle = gapValue > 0 ? { margin: -halfGap } : {};

    // Cell style: padding creates the gap between cells
    const cellStyle: ViewStyle = {
      flexBasis: basis as `${number}%`,
      maxWidth: basis as `${number}%`,
      padding: halfGap,
    };

    return (
      <View ref={ref} className="flex-row flex-wrap" style={containerStyle} {...props}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) {
            return child;
          }
          return (
            <View key={child.key ?? index} style={cellStyle} className={cellClassName}>
              {child}
            </View>
          );
        })}
      </View>
    );
  }
);

Grid.displayName = 'Grid';

export { Grid };
export type { GridProps };
