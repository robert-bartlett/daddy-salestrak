import * as React from 'react';
import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';

/**
 * This component is used to wrap animated views that should only be animated on native.
 * @param props - The props for the animated view.
 * @returns The animated view if the platform is native, otherwise the children.
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am only animated on native</Text>
 * </NativeOnlyAnimatedView>
 */
const NativeOnlyAnimatedView = React.forwardRef<
  Animated.View,
  React.ComponentProps<typeof Animated.View>
>(function NativeOnlyAnimatedView(props, ref) {
  if (Platform.OS === 'web') {
    return <>{props.children as React.ReactNode}</>;
  }
  return <Animated.View ref={ref} {...props} />;
});

NativeOnlyAnimatedView.displayName = 'NativeOnlyAnimatedView';

export { NativeOnlyAnimatedView };
