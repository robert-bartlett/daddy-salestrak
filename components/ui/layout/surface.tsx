import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import {
  PADDING_CLASSES,
  PADDING_X_CLASSES,
  PADDING_Y_CLASSES,
  ROUNDED_CLASSES,
  type RoundedToken,
  type SpacingToken,
} from './layout-constants';

const SURFACE_VARIANTS = {
  card: 'bg-card text-card-foreground',
  elevated: 'bg-card text-card-foreground shadow-sm shadow-black/5',
  muted: 'bg-muted',
  outline: 'border border-border bg-background',
  ghost: 'bg-transparent',
} as const;

type SurfaceVariant = keyof typeof SURFACE_VARIANTS;

type SurfaceProps = Omit<ViewProps, 'className' | 'style'> & {
  variant?: SurfaceVariant;
  padding?: SpacingToken;
  paddingX?: SpacingToken;
  paddingY?: SpacingToken;
  rounded?: RoundedToken;
};

const Surface = React.forwardRef<View, SurfaceProps>(
  (
    {
      variant = 'card',
      padding,
      paddingX,
      paddingY,
      rounded = 'lg',
      ...props
    },
    ref
  ) => {
    const elevationStyle =
      variant === 'elevated'
        ? Platform.select({ android: { elevation: 4 } })
        : undefined;

    return (
      <View
        ref={ref}
        className={cn(
          SURFACE_VARIANTS[variant],
          rounded ? ROUNDED_CLASSES[rounded] : undefined,
          padding ? PADDING_CLASSES[padding] : undefined,
          paddingX ? PADDING_X_CLASSES[paddingX] : undefined,
          paddingY ? PADDING_Y_CLASSES[paddingY] : undefined
        )}
        style={elevationStyle}
        {...props}
      />
    );
  }
);

Surface.displayName = 'Surface';

export { Surface };
export type { SurfaceProps, SurfaceVariant };
