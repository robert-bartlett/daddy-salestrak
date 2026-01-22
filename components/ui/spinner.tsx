import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react-native';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const DEFAULT_SPINNER_SIZE = 16;

type SpinnerProps = ViewProps & {
  /** Size of the spinner icon in pixels. Defaults to 16. */
  size?: number;
  /** Custom color for the spinner. Defaults to current text color. */
  color?: string;
  /** Utility classes applied to the icon. */
  iconClassName?: string;
};

/**
 * A loading spinner component with smooth rotation animation.
 *
 * Uses React Native Reanimated for smooth native animations and CSS
 * animations on web for optimal performance on each platform.
 *
 * @component
 * @example
 * ```tsx
 * import { Spinner } from '@/components/ui/spinner';
 *
 * // Basic usage
 * <Spinner />
 *
 * // Custom size
 * <Spinner size={24} />
 *
 * // With custom styling
 * <Spinner iconClassName="text-primary" size={20} />
 * ```
 */
function Spinner({
  className,
  iconClassName,
  size = DEFAULT_SPINNER_SIZE,
  color,
  style,
  ...props
}: SpinnerProps) {
  const rotation = useSharedValue(0);
  const isNative = Platform.OS !== 'web';

  // Start continuous rotation animation on mount (native only)
  React.useEffect(() => {
    if (isNative) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false // Don't reverse
      );
    }
  }, [isNative, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!isNative) return {};
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // On web, use CSS animation; on native, use Reanimated
  const WrapperComponent = isNative ? Animated.View : View;

  return (
    <WrapperComponent
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={isNative ? [animatedStyle, style] : style}
      className={cn(
        'items-center justify-center',
        Platform.select({ web: 'animate-spin' }),
        className
      )}
      {...props}
    >
      <Icon
        as={Loader2}
        size={size}
        color={color}
        className={iconClassName}
      />
    </WrapperComponent>
  );
}

Spinner.displayName = 'Spinner';

export { Spinner };
export type { SpinnerProps };
