import * as React from 'react';
import { Platform, Pressable, View, useColorScheme, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

// ============================================================================
// Types
// ============================================================================

export type FloatingTab = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type FloatingTabBarProps = Omit<ViewProps, 'className' | 'style'> & {
  /** Array of tabs to display */
  tabs: FloatingTab[];
  /** Currently active tab ID (null if none) */
  activeTab: string | null;
  /** Callback when a tab is pressed */
  onTabPress: (tabId: string) => void;
  /** Whether to hide the tab bar (animates out) */
  hidden?: boolean;
};

// ============================================================================
// Constants
// ============================================================================

// Floating pill height
const TAB_BAR_HEIGHT = Platform.select({
  ios: 64,
  android: 64,
  default: 64,
});

const ANIMATION_DURATION = 250;

// ============================================================================
// Component
// ============================================================================

/**
 * FloatingTabBar - Floating pill-style tab bar with native iOS glass effect
 *
 * Matches iOS 18+ floating tab bar design:
 * - Pill shape with rounded corners
 * - Floats above content with margin
 * - Dark chrome material blur for dark mode
 * - Selected state with subtle background indicator
 */
const FloatingTabBar = React.memo(
  React.forwardRef<View, FloatingTabBarProps>(
    ({ tabs, activeTab, onTabPress, hidden = false, ...props }, ref) => {
      const insets = useSafeAreaInsets();
      const colorScheme = useColorScheme();
      const isDark = colorScheme === 'dark';

      // iOS standard: floating pill sits just above the home indicator
      // Use safe area inset directly, minimum 8pt on devices without home indicator
      const bottomOffset = Math.max(insets.bottom, 8);

      // Animated style for hide/show
      const containerStyle = useAnimatedStyle(() => {
        const translateY = withTiming(hidden ? TAB_BAR_HEIGHT + bottomOffset + 20 : 0, {
          duration: ANIMATION_DURATION,
        });

        return {
          transform: [{ translateY }],
        };
      }, [hidden, bottomOffset]);

      return (
        <Animated.View
          ref={ref}
          style={[
            {
              position: 'absolute',
              bottom: bottomOffset,
              alignSelf: 'center',
              zIndex: 10,
              borderRadius: TAB_BAR_HEIGHT / 2,
              borderCurve: 'continuous',
              overflow: 'hidden',
              // Liquid glass shadow - soft, diffuse for depth
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 16,
            },
            containerStyle,
          ]}
          {...props}
        >
          {/* iOS frosted glass effect */}
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              height: TAB_BAR_HEIGHT,
              borderRadius: TAB_BAR_HEIGHT / 2,
              borderCurve: 'continuous',
              // Slightly tinted glass
              backgroundColor: 'rgba(30, 30, 30, 0.25)',
              // Specular highlight border
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.18)',
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 8,
                gap: 6,
              }}
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <TabItem
                    key={tab.id}
                    tab={tab}
                    isActive={isActive}
                    onPress={() => onTabPress(tab.id)}
                  />
                );
              })}
            </View>
          </BlurView>
        </Animated.View>
      );
    }
  )
);
FloatingTabBar.displayName = 'FloatingTabBar';

// ============================================================================
// Tab Item Component
// ============================================================================

type TabItemProps = {
  tab: FloatingTab;
  isActive: boolean;
  onPress: () => void;
};

const TabItem = React.memo(({ tab, isActive, onPress }: TabItemProps) => {
  // Colors for dark mode floating tab bar
  const activeColor = '#FFFFFF';
  const inactiveColor = 'rgba(255, 255, 255, 0.5)';
  const activeBgColor = 'rgba(255, 255, 255, 0.18)';

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: isActive ? 20 : 18,
        gap: 8,
        borderRadius: 24,
        borderCurve: 'continuous',
        backgroundColor: isActive ? activeBgColor : 'transparent',
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      {/* Icon */}
      <View>
        {React.isValidElement(tab.icon) &&
          React.cloneElement(tab.icon as React.ReactElement<{ size?: number; color?: string }>, {
            size: 24,
            color: isActive ? activeColor : inactiveColor,
          })}
      </View>
      {/* Label - only show for active tab */}
      {isActive ? (
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: activeColor,
          }}
        >
          {tab.label}
        </Text>
      ) : null}
    </Pressable>
  );
});
TabItem.displayName = 'TabItem';

// Export for use in other components
// PILL_HEIGHT is the height of the floating pill itself
// BOTTOM_OFFSET is the total space needed at the bottom (pill + margin + safe area)
const PILL_HEIGHT = TAB_BAR_HEIGHT;
const BOTTOM_OFFSET = TAB_BAR_HEIGHT + 32; // pill height + bottom margin

export { FloatingTabBar, PILL_HEIGHT, BOTTOM_OFFSET };
export type { FloatingTabBarProps };
