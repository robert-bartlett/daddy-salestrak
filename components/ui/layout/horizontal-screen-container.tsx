import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// ============================================================================
// Types
// ============================================================================

type HorizontalScreenContainerProps = {
  /**
   * Currently active screen index:
   * - -1: left screen (search)
   * - 0: center screen (home)
   * - 1: right screen (inbox)
   */
  activeIndex: -1 | 0 | 1;
  /** Left screen content (search) */
  leftScreen: React.ReactNode;
  /** Center screen content (home) */
  centerScreen: React.ReactNode;
  /** Right screen content (inbox) */
  rightScreen: React.ReactNode;
  /** Animation duration in ms. Defaults to 300 */
  duration?: number;
  /** Skip animation for this transition */
  skipAnimation?: boolean;
  /** Callback when animation completes or is skipped */
  onTransitionComplete?: () => void;
};

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_DURATION = 300;

// ============================================================================
// Component
// ============================================================================

/**
 * HorizontalScreenContainer - Animated horizontal screen slider
 *
 * Manages three screens in a horizontal layout with smooth slide animations.
 * The center screen (home) is shown by default, with the ability to slide
 * left to reveal the right screen or slide right to reveal the left screen.
 *
 * @example
 * ```tsx
 * <HorizontalScreenContainer
 *   activeIndex={0}
 *   leftScreen={<SearchScreen />}
 *   centerScreen={<HomeScreen />}
 *   rightScreen={<InboxScreen />}
 * />
 * ```
 */
const HorizontalScreenContainer = React.memo(
  ({
    activeIndex,
    leftScreen,
    centerScreen,
    rightScreen,
    duration = DEFAULT_DURATION,
    skipAnimation,
    onTransitionComplete,
  }: HorizontalScreenContainerProps) => {
    const { width: screenWidth } = useWindowDimensions();

    // Track the target position for animation
    const translateX = useSharedValue(-screenWidth); // Start at center (index 0)

    // Update animation when activeIndex changes
    React.useEffect(() => {
      // Calculate target translateX based on activeIndex
      // activeIndex -1 (left/search): translateX = 0 (show left screen)
      // activeIndex 0 (center/home): translateX = -screenWidth (show center)
      // activeIndex 1 (right/inbox): translateX = -screenWidth * 2 (show right)
      const targetX = -screenWidth * (activeIndex + 1);

      if (skipAnimation) {
        translateX.value = targetX;
        onTransitionComplete?.();
      } else {
        translateX.value = withTiming(targetX, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
      }
    }, [activeIndex, screenWidth, duration, skipAnimation, onTransitionComplete, translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              width: screenWidth * 3,
              height: '100%',
            },
            animatedStyle,
          ]}
        >
          {/* Left screen (search) */}
          <View style={{ width: screenWidth, height: '100%' }}>
            {leftScreen}
          </View>

          {/* Center screen (home) */}
          <View style={{ width: screenWidth, height: '100%' }}>
            {centerScreen}
          </View>

          {/* Right screen (inbox) */}
          <View style={{ width: screenWidth, height: '100%' }}>
            {rightScreen}
          </View>
        </Animated.View>
      </View>
    );
  }
);

HorizontalScreenContainer.displayName = 'HorizontalScreenContainer';

export { HorizontalScreenContainer };
export type { HorizontalScreenContainerProps };
