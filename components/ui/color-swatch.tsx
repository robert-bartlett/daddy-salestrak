import * as React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  xs: 'h-2 w-2',
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
} as const;

const ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const;

type ColorSwatchProps = Omit<ViewProps, 'style'> & {
  color: string;
  size?: keyof typeof SIZE_CLASSES;
  rounded?: keyof typeof ROUNDED_CLASSES;
};

/**
 * ColorSwatch - Displays a colored square or circle
 *
 * Use for project indicators, status dots, category markers, etc.
 *
 * @example
 * ```tsx
 * <ColorSwatch color="#ef4444" size="md" rounded="sm" />
 * <ColorSwatch color={project.color} size="sm" rounded="full" />
 * ```
 */
const ColorSwatch = React.memo(
  React.forwardRef<View, ColorSwatchProps>(
    ({ color, size = 'md', rounded = 'sm', className, ...props }, ref) => {
      const style = React.useMemo<ViewStyle>(
        () => ({ backgroundColor: color }),
        [color]
      );

      return (
        <View
          ref={ref}
          className={cn(SIZE_CLASSES[size], ROUNDED_CLASSES[rounded], className)}
          style={style}
          {...props}
        />
      );
    }
  )
);
ColorSwatch.displayName = 'ColorSwatch';

export { ColorSwatch };
export type { ColorSwatchProps };
