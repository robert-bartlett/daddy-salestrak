import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
import {
  PADDING_CLASSES,
  PADDING_X_CLASSES,
  PADDING_Y_CLASSES,
  ROUNDED_CLASSES,
  type RoundedToken,
  type SpacingToken,
} from './layout-constants';

const SURFACE_VARIANTS = {
  card: 'bg-card text-card-foreground dark:bg-card',
  elevated: 'bg-card text-card-foreground dark:bg-card shadow-sm shadow-black/5',
  muted: 'bg-muted dark:bg-secondary',
  outline: 'border border-border bg-background dark:bg-input/30 dark:border-input',
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

/**
 * Surface - A styled container with visual treatments
 *
 * Provides pre-defined visual variants for common container styles.
 * The `elevated` variant uses CSS shadows on web and native elevation on Android.
 *
 * @example
 * ```tsx
 * <Surface variant="elevated" padding="lg" rounded="xl">
 *   <Text>Elevated panel with shadow</Text>
 * </Surface>
 * ```
 */
const Surface = React.memo(
  React.forwardRef<View, SurfaceProps>(
    ({ variant = 'card', padding, paddingX, paddingY, rounded = 'lg', ...props }, ref) => {
      const debugStyle = useDebugStyle();

      const combinedStyle = React.useMemo<ViewStyle | undefined>(() => {
        const needsElevation = variant === 'elevated' && Platform.OS === 'android';
        if (!needsElevation && !debugStyle) return undefined;

        return {
          ...(needsElevation && { elevation: 4 }),
          ...debugStyle,
        };
      }, [variant, debugStyle]);

      return (
        <View
          ref={ref}
          className={cn(
            // Always apply dark class on native (app is dark mode only)
            Platform.OS !== 'web' && 'dark',
            SURFACE_VARIANTS[variant],
            rounded && ROUNDED_CLASSES[rounded],
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
Surface.displayName = 'Surface';

export { Surface };
export type { SurfaceProps };
