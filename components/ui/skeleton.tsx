import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Animation timing for pulse effect
const PULSE_DURATION_MS = 1500;
const PULSE_MIN_OPACITY = 0.5;
const PULSE_MAX_OPACITY = 1;

type SkeletonProps = React.ComponentProps<typeof View>;

/**
 * A placeholder loading animation component.
 *
 * @remarks
 * - On web: Uses CSS `animate-pulse` for smooth performance
 * - On native: Uses Reanimated for opacity pulse animation
 * - Apply width and height via className (e.g., `w-24 h-4`)
 */
const Skeleton = React.forwardRef<View, SkeletonProps>(
  ({ className, ...props }, ref) => {
    const opacity = useSharedValue(PULSE_MAX_OPACITY);

    React.useEffect(() => {
      if (Platform.OS !== 'web') {
        opacity.value = withRepeat(
          withTiming(PULSE_MIN_OPACITY, {
            duration: PULSE_DURATION_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          -1, // Infinite repeat
          true // Reverse
        );
      }
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => {
      if (Platform.OS === 'web') return {};
      return {
        opacity: opacity.value,
      };
    });

    if (Platform.OS === 'web') {
      return (
        <View
          ref={ref}
          className={cn('animate-pulse rounded-md bg-muted', className)}
          {...props}
        />
      );
    }

    return (
      <Animated.View
        ref={ref}
        style={animatedStyle}
        className={cn('rounded-md bg-muted', className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type { SkeletonProps };
