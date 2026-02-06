import * as React from 'react';
import { Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import type { LucideIcon } from 'lucide-react-native';

// ============================================================================
// Types
// ============================================================================

export type FloatingActionPillAction = {
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
};

type FloatingActionPillProps = {
  actions: FloatingActionPillAction[];
};

// ============================================================================
// Constants
// ============================================================================

const PILL_HEIGHT = 52;
const ICON_SIZE = 22;
const TOUCH_TARGET = 44;
/** Bottom margin from bottom edge of parent container */
const BOTTOM_MARGIN = 16;

// ============================================================================
// Component
// ============================================================================

/**
 * FloatingActionPill - Compact centered floating action bar
 *
 * Apple Maps-style dark glass pill with icon-only buttons.
 * Absolutely positioned at the bottom of its parent container.
 * Parent must use flex: 1 to match the visible sheet area
 * (not a fixed windowHeight) so the pill stays visible at any detent.
 *
 * Matches FloatingTabBar visual treatment (blur, tint, specular border, shadow).
 */
const FloatingActionPill = React.memo(function FloatingActionPill({
  actions,
}: FloatingActionPillProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: BOTTOM_MARGIN,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <View
        style={{
          borderRadius: PILL_HEIGHT / 2,
          borderCurve: 'continuous',
          overflow: 'hidden',
          // Shadow matching FloatingTabBar
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 16,
        }}
      >
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            height: PILL_HEIGHT,
            borderRadius: PILL_HEIGHT / 2,
            borderCurve: 'continuous',
            backgroundColor: 'rgba(30, 30, 30, 0.25)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.18)',
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 6,
            }}
          >
            {actions.map((action, index) => (
              <React.Fragment key={action.accessibilityLabel}>
                {index > 0 ? (
                  <View
                    style={{
                      width: 1,
                      height: 24,
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    }}
                  />
                ) : null}
                <ActionButton action={action} />
              </React.Fragment>
            ))}
          </View>
        </BlurView>
      </View>
    </View>
  );
});

FloatingActionPill.displayName = 'FloatingActionPill';

// ============================================================================
// Action Button
// ============================================================================

type ActionButtonProps = {
  action: FloatingActionPillAction;
};

const ActionButton = React.memo(function ActionButton({ action }: ActionButtonProps) {
  const IconComponent = action.icon;

  return (
    <Pressable
      onPress={action.onPress}
      disabled={action.disabled}
      accessibilityLabel={action.accessibilityLabel}
      accessibilityRole="button"
      style={{
        width: TOUCH_TARGET,
        height: TOUCH_TARGET,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {({ pressed }) => (
        <IconComponent
          size={ICON_SIZE}
          color="#FFFFFF"
          strokeWidth={2.5}
          style={{
            opacity: action.disabled ? 0.3 : pressed ? 0.5 : 1,
          }}
        />
      )}
    </Pressable>
  );
});

ActionButton.displayName = 'ActionButton';

// ============================================================================
// Exports
// ============================================================================

/** Space to reserve at the bottom of scroll content so pill doesn't cover it */
const ACTION_PILL_FOOTER_HEIGHT = PILL_HEIGHT + BOTTOM_MARGIN + 16;

export { FloatingActionPill, ACTION_PILL_FOOTER_HEIGHT };
export type { FloatingActionPillProps };
