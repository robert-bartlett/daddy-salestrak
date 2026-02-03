import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

// Match the tab bar heights from (tabs)/_layout.tsx
const TAB_BAR_HEIGHT = Platform.select({
  ios: 88,
  android: 64,
  default: 64,
});

type BottomNavProps = Omit<ViewProps, 'className' | 'style'> & {
  /** Content for the left slot (e.g., back button) */
  left?: React.ReactNode;
  /** Content for the center slot (e.g., breadcrumb) */
  center?: React.ReactNode;
  /** Content for the right slot (e.g., action button) */
  right?: React.ReactNode;
};

/**
 * BottomNav - A bottom navigation bar that overlays the tab bar
 *
 * Designed to match the system tab bar dimensions and styling.
 * Position this absolutely at the bottom of a container to overlay the tab bar.
 *
 * @example
 * ```tsx
 * <BottomNav
 *   left={<Button variant="ghost" onPress={goBack}><Icon as={ChevronLeft} /> Back</Button>}
 *   center={<Text>Workflow > Stage</Text>}
 *   right={<Button onPress={addProject}><Icon as={Plus} /></Button>}
 * />
 * ```
 */
const BottomNav = React.memo(
  React.forwardRef<View, BottomNavProps>(({ left, center, right, ...props }, ref) => {
    const insets = useSafeAreaInsets();

    return (
      <View
        ref={ref}
        className={cn(
          'absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t border-border bg-card px-4'
        )}
        style={{
          height: TAB_BAR_HEIGHT,
          paddingBottom: Platform.select({
            ios: insets.bottom > 0 ? insets.bottom : 8,
            android: 8,
            default: 0,
          }),
        }}
        {...props}
      >
        {/* Left slot */}
        <View className="min-w-[80px] flex-row items-center justify-start">
          {left}
        </View>

        {/* Center slot */}
        <View className="flex-1 flex-row items-center justify-center">
          {center}
        </View>

        {/* Right slot */}
        <View className="min-w-[80px] flex-row items-center justify-end">
          {right}
        </View>
      </View>
    );
  })
);
BottomNav.displayName = 'BottomNav';

export { BottomNav, TAB_BAR_HEIGHT };
export type { BottomNavProps };
