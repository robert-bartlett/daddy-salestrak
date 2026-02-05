import * as React from 'react';
import { Platform, Pressable, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const TAB_BAR_HEIGHT = Platform.select({
  ios: 84,
  android: 64,
  default: 64,
});

const ANIMATION_DURATION = 250;

// ============================================================================
// Component
// ============================================================================

/**
 * BottomTabBar - Find My-style fixed bottom tab bar
 *
 * A standard iOS-style bottom tab bar that sits at the bottom of the screen.
 * Can animate out when hidden.
 */
const FloatingTabBar = React.memo(
  React.forwardRef<View, FloatingTabBarProps>(
    ({ tabs, activeTab, onTabPress, hidden = false, ...props }, ref) => {
      const insets = useSafeAreaInsets();

      // Animated style for hide/show
      const containerStyle = useAnimatedStyle(() => {
        const translateY = withTiming(hidden ? TAB_BAR_HEIGHT + insets.bottom : 0, {
          duration: ANIMATION_DURATION,
        });

        return {
          transform: [{ translateY }],
        };
      }, [hidden, insets.bottom]);

      return (
        <Animated.View
          ref={ref}
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: '#161618',
              borderTopWidth: 0.5,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
              paddingBottom: insets.bottom,
              height: TAB_BAR_HEIGHT + insets.bottom,
            },
            containerStyle,
          ]}
          {...props}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              paddingHorizontal: 8,
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
  // Active color - iOS blue
  const activeColor = '#0A84FF';
  const inactiveColor = 'rgba(255, 255, 255, 0.5)';

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        gap: 4,
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
      {/* Label */}
      <Text
        style={{
          fontSize: 10,
          fontWeight: '500',
          color: isActive ? activeColor : inactiveColor,
        }}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
});
TabItem.displayName = 'TabItem';

// Export TAB_BAR_HEIGHT for use in other components
const BOTTOM_OFFSET = 0; // No offset needed for fixed tab bar

export { FloatingTabBar, TAB_BAR_HEIGHT as PILL_HEIGHT, BOTTOM_OFFSET };
export type { FloatingTabBarProps };
