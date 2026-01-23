import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import {
  PADDING_CLASSES,
  PADDING_X_CLASSES,
  PADDING_Y_CLASSES,
  ROUNDED_CLASSES,
  SPACING_SCALE,
  type RoundedToken,
  type SpacingToken,
} from './layout-constants';

const BACKGROUND_CLASSES = {
  default: 'bg-background',
  card: 'bg-card',
  muted: 'bg-muted',
  accent: 'bg-accent',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  popover: 'bg-popover',
  transparent: 'bg-transparent',
  sidebar: 'bg-sidebar-background',
  'sidebar-primary': 'bg-sidebar-primary',
  'sidebar-accent': 'bg-sidebar-accent',
} as const;

type BackgroundToken = keyof typeof BACKGROUND_CLASSES;

type BoxProps = Omit<ViewProps, 'className' | 'style'> & {
  padding?: SpacingToken;
  paddingX?: SpacingToken;
  paddingY?: SpacingToken;
  background?: BackgroundToken | string;
  rounded?: RoundedToken;
  border?: boolean;
  fill?: boolean;
  size?: SpacingToken | number;
};

const Box = React.forwardRef<View, BoxProps>(
  (
    {
      padding,
      paddingX,
      paddingY,
      background,
      rounded,
      border,
      fill,
      size,
      ...props
    },
    ref
  ) => {
    const backgroundClass =
      background && background in BACKGROUND_CLASSES
        ? BACKGROUND_CLASSES[background as BackgroundToken]
        : undefined;
    const backgroundStyle =
      background && !(background in BACKGROUND_CLASSES)
        ? { backgroundColor: background }
        : undefined;
    const sizeValue =
      typeof size === 'number' ? size : size ? SPACING_SCALE[size] : undefined;
    const sizeStyle = sizeValue ? { width: sizeValue, height: sizeValue } : undefined;

    return (
      <View
        ref={ref}
        className={cn(
          fill ? 'flex-1 self-stretch' : undefined,
          padding ? PADDING_CLASSES[padding] : undefined,
          paddingX ? PADDING_X_CLASSES[paddingX] : undefined,
          paddingY ? PADDING_Y_CLASSES[paddingY] : undefined,
          backgroundClass,
          rounded ? ROUNDED_CLASSES[rounded] : undefined,
          border ? 'border border-border' : undefined
        )}
        style={[backgroundStyle, sizeStyle]}
        {...props}
      />
    );
  }
);

Box.displayName = 'Box';

export { Box };
export type { BoxProps };
