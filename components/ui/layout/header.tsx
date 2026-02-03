import * as React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useDebugStyle } from './layout-debug-context';
import {
  BACKGROUND_CLASSES,
  PADDING_X_CLASSES,
  type BackgroundToken,
  type SpacingToken,
} from './layout-constants';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type HeaderProps = {
  /** Header title */
  title?: string;
  /** Subtitle text displayed below the title */
  subtitle?: string;
  /** Callback when back button is pressed. If not provided, back button is hidden. */
  onBackPress?: () => void;
  /** Custom left content. Replaces back button if provided. */
  left?: React.ReactNode;
  /** Custom right content (actions, buttons, etc.) */
  right?: React.ReactNode;
  /** Background color token. Defaults to 'card' */
  background?: BackgroundToken;
  /** Horizontal padding. Defaults to 'md' */
  paddingX?: SpacingToken;
  /** Whether to apply top safe area inset. Defaults to true. */
  safeAreaTop?: boolean;
  /** Show bottom border. Defaults to false. */
  bordered?: boolean;
  /** Make the header transparent (no background). */
  transparent?: boolean;
};

/**
 * Header - A standardized header component with safe area handling
 *
 * Provides a consistent header layout with optional back button, title, and actions.
 * Automatically handles top safe area inset.
 *
 * @example
 * ```tsx
 * // Simple header with back button
 * <Header title="Project Details" onBackPress={() => router.back()} />
 *
 * // Header with custom actions
 * <Header
 *   title="Projects"
 *   right={
 *     <HStack gap="xs">
 *       <Button variant="ghost" size="icon"><Icon as={Star} /></Button>
 *       <Button variant="ghost" size="icon"><Icon as={Edit} /></Button>
 *     </HStack>
 *   }
 * />
 *
 * // Transparent header for overlay on map
 * <Header transparent onBackPress={() => router.back()} />
 * ```
 */
const Header = React.memo(
  ({
    title,
    subtitle,
    onBackPress,
    left,
    right,
    background = 'card',
    paddingX = 'md',
    safeAreaTop = true,
    bordered = false,
    transparent = false,
  }: HeaderProps) => {
    const insets = useSafeAreaInsets();
    const debugStyle = useDebugStyle();

    const containerStyle = React.useMemo(
      () => ({
        paddingTop: safeAreaTop ? insets.top : 0,
        ...debugStyle,
      }),
      [safeAreaTop, insets.top, debugStyle]
    );

    const leftContent = left ?? (
      onBackPress ? (
        <Pressable
          onPress={onBackPress}
          hitSlop={8}
          className={cn(
            'h-10 w-10 items-center justify-center rounded-md',
            Platform.select({ web: 'hover:bg-accent active:bg-accent' })
          )}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon as={ArrowLeft} size={24} />
        </Pressable>
      ) : null
    );

    return (
      <View
        className={cn(
          !transparent && background && BACKGROUND_CLASSES[background],
          bordered && 'border-b border-border',
          paddingX && PADDING_X_CLASSES[paddingX]
        )}
        style={containerStyle}
      >
        <View className="h-14 flex-row items-center justify-between">
          {/* Center section - title (absolutely positioned for true centering) */}
          {(title || subtitle) && (
            <View className="absolute inset-0 items-center justify-center px-16">
              {title && (
                <Text weight="semibold" numberOfLines={1}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text size="xs" tone="muted" numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* Left section */}
          <View className="z-10 min-w-[48px] flex-row items-center justify-start">
            {leftContent}
          </View>

          {/* Spacer to push right section to the end */}
          <View className="flex-1" />

          {/* Right section */}
          <View className="z-10 min-w-[48px] flex-row items-center justify-end">
            {right}
          </View>
        </View>
      </View>
    );
  }
);

Header.displayName = 'Header';

export { Header };
export type { HeaderProps };
