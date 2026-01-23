import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { TextClassContext } from '@/components/ui/text';

import { useEmptySize } from './empty-context';

// Animation constants (match Skeleton)
const PULSE_DURATION_MS = 1500;
const PULSE_MIN_OPACITY = 0.5;
const PULSE_MAX_OPACITY = 1;

// Icon text class for TextClassContext to style icons
// Using a constant since all sizes share the same muted foreground color
const ICON_TEXT_CLASS = 'text-muted-foreground';

const emptyMediaVariants = cva('items-center justify-center rounded-full', {
  variants: {
    size: {
      sm: 'w-10 h-10',
      md: 'w-14 h-14',
      lg: 'w-[72px] h-[72px]',
    },
    variant: {
      icon: 'bg-muted',
      image: '', // No background for images
      animation: 'bg-muted',
    },
  },
  defaultVariants: {
    variant: 'icon',
  },
});

type EmptyMediaProps = React.ComponentProps<typeof View> & {
  variant?: 'icon' | 'image' | 'animation';
};

const EmptyMedia = React.forwardRef<View, EmptyMediaProps>(
  ({ variant = 'icon', className, children, ...props }, ref) => {
    const size = useEmptySize();
    const opacity = useSharedValue(PULSE_MAX_OPACITY);

    React.useEffect(() => {
      if (variant === 'animation' && Platform.OS !== 'web') {
        opacity.value = withRepeat(
          withTiming(PULSE_MIN_OPACITY, {
            duration: PULSE_DURATION_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        );
      }
    }, [variant]);

    const animatedStyle = useAnimatedStyle(() => {
      if (variant !== 'animation' || Platform.OS === 'web') return {};
      return { opacity: opacity.value };
    });

    // Animation variant rendering
    if (variant === 'animation') {
      const baseClassName = cn(emptyMediaVariants({ size, variant }), className);

      if (Platform.OS === 'web') {
        return (
          <View
            ref={ref}
            className={cn(baseClassName, 'animate-pulse')}
            {...props}
          >
            {children}
          </View>
        );
      }

      return (
        <Animated.View
          ref={ref as React.Ref<Animated.View>}
          style={animatedStyle}
          className={baseClassName}
          {...props}
        >
          {children}
        </Animated.View>
      );
    }

    // Image variant - no container styling, max-width constraint
    if (variant === 'image') {
      return (
        <View ref={ref} className={cn('max-w-[200px]', className)} {...props}>
          {children}
        </View>
      );
    }

    // Icon variant - circular background with TextClassContext for icon color
    return (
      <TextClassContext.Provider value={ICON_TEXT_CLASS}>
        <View
          ref={ref}
          className={cn(emptyMediaVariants({ size, variant }), className)}
          {...props}
        >
          {children}
        </View>
      </TextClassContext.Provider>
    );
  }
);

EmptyMedia.displayName = 'EmptyMedia';

export { EmptyMedia, emptyMediaVariants };
export type { EmptyMediaProps };
