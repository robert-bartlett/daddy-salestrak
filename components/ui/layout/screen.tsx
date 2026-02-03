import * as React from 'react';
import { Platform, ScrollView, View, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import { useDebugStyle } from './layout-debug-context';
import {
  BACKGROUND_CLASSES,
  PADDING_X_CLASSES,
  type BackgroundToken,
  type SpacingToken,
} from './layout-constants';

type SafeAreaEdges = 'all' | 'top' | 'bottom' | 'horizontal' | 'none';

type ScreenProps = {
  children: React.ReactNode;
  /** Which safe area edges to apply. Defaults to 'all' */
  safeArea?: SafeAreaEdges;
  /** Background color token. Defaults to 'default' */
  background?: BackgroundToken;
  /** Horizontal padding applied to content */
  paddingX?: SpacingToken;
  /** Additional padding added to top safe area inset */
  topPadding?: number;
  /** Additional padding added to bottom safe area inset */
  bottomPadding?: number;
  /** Enable scrolling. When true, content is wrapped in ScrollView */
  scroll?: boolean;
  /** Enable keyboard avoiding behavior for forms. Only applies when scroll is true. */
  keyboardAvoiding?: boolean;
  /** Additional bottom padding to account for tab bar */
  tabBarPadding?: number;
};

/**
 * Screen - A foundational component for full-screen layouts with built-in safe area handling
 *
 * Automatically applies safe area insets based on the `safeArea` prop. Provides consistent
 * screen structure across the app without requiring manual safe area calculations.
 *
 * @example
 * ```tsx
 * // Basic screen
 * <Screen background="default" paddingX="md">
 *   <Text>Content</Text>
 * </Screen>
 *
 * // Scrollable screen with keyboard avoiding
 * <Screen scroll keyboardAvoiding paddingX="md">
 *   <Input />
 * </Screen>
 *
 * // Screen with custom top padding (for screens with a header)
 * <Screen safeArea="bottom" paddingX="md">
 *   <Header />
 *   <Content />
 * </Screen>
 * ```
 */
const Screen = React.memo(
  ({
    children,
    safeArea = 'all',
    background = 'default',
    paddingX,
    topPadding = 0,
    bottomPadding = 0,
    scroll = false,
    keyboardAvoiding = false,
    tabBarPadding = 0,
  }: ScreenProps) => {
    const insets = useSafeAreaInsets();
    const debugStyle = useDebugStyle();

    const safeAreaPadding = React.useMemo(() => {
      const padding = { top: 0, bottom: 0, left: 0, right: 0 };

      switch (safeArea) {
        case 'all':
          padding.top = insets.top;
          padding.bottom = insets.bottom;
          padding.left = insets.left;
          padding.right = insets.right;
          break;
        case 'top':
          padding.top = insets.top;
          break;
        case 'bottom':
          padding.bottom = insets.bottom;
          break;
        case 'horizontal':
          padding.left = insets.left;
          padding.right = insets.right;
          break;
        case 'none':
          break;
      }

      return padding;
    }, [safeArea, insets]);

    const containerStyle = React.useMemo(
      () => ({
        flex: 1,
        ...debugStyle,
      }),
      [debugStyle]
    );

    const contentContainerStyle = React.useMemo(
      () => ({
        paddingTop: safeAreaPadding.top + topPadding,
        paddingBottom: safeAreaPadding.bottom + bottomPadding + tabBarPadding,
        paddingLeft: safeAreaPadding.left,
        paddingRight: safeAreaPadding.right,
        flexGrow: scroll ? 1 : undefined,
      }),
      [safeAreaPadding, topPadding, bottomPadding, tabBarPadding, scroll]
    );

    const content = (
      <View
        className={cn(paddingX && PADDING_X_CLASSES[paddingX])}
        style={scroll ? undefined : contentContainerStyle}
      >
        {children}
      </View>
    );

    if (scroll) {
      const scrollContent = (
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      );

      if (keyboardAvoiding && Platform.OS === 'ios') {
        return (
          <View
            className={cn('flex-1', background && BACKGROUND_CLASSES[background])}
            style={containerStyle}
          >
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
              {scrollContent}
            </KeyboardAvoidingView>
          </View>
        );
      }

      return (
        <View
          className={cn('flex-1', background && BACKGROUND_CLASSES[background])}
          style={containerStyle}
        >
          {scrollContent}
        </View>
      );
    }

    return (
      <View
        className={cn('flex-1', background && BACKGROUND_CLASSES[background])}
        style={{ ...containerStyle, ...contentContainerStyle }}
      >
        {children}
      </View>
    );
  }
);

Screen.displayName = 'Screen';

export { Screen };
export type { ScreenProps, SafeAreaEdges };
