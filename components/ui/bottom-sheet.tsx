import * as React from 'react';
import { View, Platform, useColorScheme, ScrollView, type ScrollViewProps, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetSectionList,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetFooter as GorhomBottomSheetFooter,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps as GorhomBottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { cn } from '@/lib/utils';
import { Text, wrapTextChildren } from '@/components/ui/text';
import { DEFAULT_MODAL_SNAP_POINTS, FULL_RANGE_SNAP_POINTS } from '@/lib/sheet-config';
import { getIOSSheetColors } from '@/lib/ios-colors';

// Re-export sheet config for convenience
export { IOS_SHEET_DETENTS, DEFAULT_MODAL_SNAP_POINTS, FULL_RANGE_SNAP_POINTS } from '@/lib/sheet-config';

type BottomSheetProps = {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Snap points as percentages or pixel values. Defaults to ['50%', '90%'] */
  snapPoints?: (string | number)[];
  /** Index to snap to when opened. Defaults to 0 (first snap point) */
  initialSnapIndex?: number;
  /** Enable dynamic sizing based on content. When true, snapPoints is ignored. */
  enableDynamicSizing?: boolean;
  /** Whether to close on backdrop press. Defaults to true */
  closeOnBackdropPress?: boolean;
  /** Whether to enable pan down to close. Defaults to true */
  enablePanDownToClose?: boolean;
  /** Children content */
  children: React.ReactNode;
};

/**
 * A native iOS-style bottom sheet with drag gestures and snap points.
 *
 * @remarks
 * - Supports drag-to-expand and drag-to-dismiss gestures
 * - Multiple snap points for different heights
 * - Backdrop tap to dismiss
 * - Smooth native animations via react-native-reanimated
 *
 * @example
 * ```tsx
 * <BottomSheet open={isOpen} onOpenChange={setIsOpen}>
 *   <BottomSheetHeader>
 *     <BottomSheetTitle>Title</BottomSheetTitle>
 *   </BottomSheetHeader>
 *   <BottomSheetBody>
 *     <Text>Content here</Text>
 *   </BottomSheetBody>
 * </BottomSheet>
 * ```
 */
const BottomSheet = React.forwardRef<GorhomBottomSheet, BottomSheetProps>(
  (
    {
      open,
      onOpenChange,
      snapPoints = DEFAULT_MODAL_SNAP_POINTS,
      initialSnapIndex = 0,
      enableDynamicSizing = false,
      closeOnBackdropPress = true,
      enablePanDownToClose = true,
      children,
    },
    ref
  ) => {
    const internalRef = React.useRef<GorhomBottomSheet>(null);
    const sheetRef = (ref as React.RefObject<GorhomBottomSheet>) || internalRef;
    const colorScheme = useColorScheme();
    const colors = getIOSSheetColors(colorScheme);

    // Handle open/close state changes
    React.useEffect(() => {
      if (open) {
        sheetRef.current?.snapToIndex(initialSnapIndex);
      } else {
        sheetRef.current?.close();
      }
    }, [open, initialSnapIndex, sheetRef]);

    // Handle sheet state changes
    const handleSheetChanges = React.useCallback(
      (index: number) => {
        if (index === -1) {
          onOpenChange(false);
        }
      },
      [onOpenChange]
    );

    // Custom backdrop with fade animation
    const renderBackdrop = React.useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={closeOnBackdropPress ? 'close' : 'none'}
          opacity={0.5}
        />
      ),
      [closeOnBackdropPress]
    );

    return (
      <GorhomBottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={enableDynamicSizing ? undefined : snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: colors.grabber,
          width: 36,
          height: 5,
        }}
        backgroundStyle={{
          backgroundColor: colors.background,
        }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Wrapper View to apply dark mode class on native platforms.
            On native, the portal renders outside the main React tree,
            so we need to explicitly apply the dark class for CSS variables. */}
        <View className={cn(Platform.OS !== 'web' && 'dark', 'flex-1')}>
          {children}
        </View>
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

// ============================================================================
// Header Components
// ============================================================================

type BottomSheetHeaderProps = React.ComponentProps<typeof View>;

const BottomSheetHeader = React.forwardRef<View, BottomSheetHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(Platform.OS !== 'web' && 'dark', 'flex flex-col gap-2 px-4 pb-2 pt-2', className)}
        {...props}
      />
    );
  }
);

BottomSheetHeader.displayName = 'BottomSheetHeader';

type BottomSheetTitleProps = Omit<React.ComponentProps<typeof Text>, 'ref'>;

const BottomSheetTitle = ({ className, children, ...props }: BottomSheetTitleProps) => {
  return (
    <Text
      className={cn('text-lg font-semibold', className)}
      {...props}
    >
      {children}
    </Text>
  );
};

BottomSheetTitle.displayName = 'BottomSheetTitle';

// ============================================================================
// Body Components
// ============================================================================

type BottomSheetBodyProps = React.ComponentProps<typeof View>;

/**
 * Non-scrollable body container for bottom sheet content.
 * Use BottomSheetScrollBody for scrollable content.
 */
const BottomSheetBody = React.forwardRef<View, BottomSheetBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <BottomSheetView>
        <View
          ref={ref}
          className={cn(Platform.OS !== 'web' && 'dark', 'px-4', className)}
          {...props}
        />
      </BottomSheetView>
    );
  }
);

BottomSheetBody.displayName = 'BottomSheetBody';

type BottomSheetScrollBodyProps = Omit<React.ComponentProps<typeof BottomSheetScrollView>, 'ref'>;

/**
 * Scrollable body container for bottom sheet content.
 * Handles nested scroll gestures properly with the sheet drag.
 */
const BottomSheetScrollBody = ({ className, contentContainerStyle, children, ...props }: BottomSheetScrollBodyProps) => {
  return (
    <BottomSheetScrollView
      className={cn('flex-1', className)}
      contentContainerStyle={[{ paddingHorizontal: 16 }, contentContainerStyle]}
      {...props}
    >
      {/* Dark mode wrapper for native - ensures CSS variables work in portal */}
      <View className={cn(Platform.OS !== 'web' && 'dark')}>
        {children}
      </View>
    </BottomSheetScrollView>
  );
};

BottomSheetScrollBody.displayName = 'BottomSheetScrollBody';

// ============================================================================
// Native Sheet Components (for use in native iOS formSheet modals)
// ============================================================================

type NativeSheetHeaderProps = ViewProps;

/**
 * Header component for native iOS formSheet modals.
 * Matches BottomSheetHeader styling but works outside gorhom context.
 * Has extra top padding to account for native grab handle.
 */
const NativeSheetHeader = React.forwardRef<View, NativeSheetHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(Platform.OS !== 'web' && 'dark', 'flex flex-col gap-2 px-4 pb-2 pt-6', className)}
        {...props}
      />
    );
  }
);

NativeSheetHeader.displayName = 'NativeSheetHeader';

type NativeSheetScrollBodyProps = ScrollViewProps;

/**
 * Scrollable body component for native iOS formSheet modals.
 * Matches BottomSheetScrollBody styling but uses regular ScrollView.
 * Has top padding to account for native grab handle when no header is used.
 */
const NativeSheetScrollBody = React.forwardRef<ScrollView, NativeSheetScrollBodyProps>(
  ({ className, contentContainerStyle, children, style, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        className={className}
        style={[{ flex: 1 }, style]}
        contentContainerStyle={[{ paddingHorizontal: 16, paddingTop: 8 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {/* Dark mode wrapper for native - ensures CSS variables work */}
        <View className={cn(Platform.OS !== 'web' && 'dark')}>
          {children}
        </View>
      </ScrollView>
    );
  }
);

NativeSheetScrollBody.displayName = 'NativeSheetScrollBody';

type NativeSheetFooterProps = ViewProps & {
  /** Additional bottom padding beyond safe area insets */
  extraBottomPadding?: number;
};

/**
 * Footer component for native iOS formSheet modals.
 * Uses absolute positioning to stay fixed at the bottom of the sheet.
 * Content above should have extra bottom padding to account for footer height.
 */
const NativeSheetFooter = React.forwardRef<View, NativeSheetFooterProps>(
  ({ className, style, extraBottomPadding = 8, children, ...props }, ref) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getIOSSheetColors(colorScheme);

    return (
      <View
        ref={ref}
        className={cn(Platform.OS !== 'web' && 'dark', className)}
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 8) + extraBottomPadding,
            backgroundColor: colors.background,
            zIndex: 9999,
            elevation: 9999,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

NativeSheetFooter.displayName = 'NativeSheetFooter';

// ============================================================================
// Footer Component
// ============================================================================

type BottomSheetFooterProps = React.ComponentProps<typeof View>;

/**
 * Footer component that stays fixed at the bottom of the visible sheet area.
 * Uses absolute positioning to ensure it's always visible regardless of scroll position.
 */
const BottomSheetFooter = React.forwardRef<View, BottomSheetFooterProps>(
  ({ className, children, ...props }, ref) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getIOSSheetColors(colorScheme);

    return (
      <View
        ref={ref}
        className={cn(Platform.OS !== 'web' && 'dark', className)}
        style={{
          padding: 16,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: colors.background,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
        }}
        {...props}
      >
        {children}
      </View>
    );
  }
);

BottomSheetFooter.displayName = 'BottomSheetFooter';

// ============================================================================
// Modal Variant (renders at root level, over everything)
// ============================================================================

type BottomSheetModalProps = BottomSheetProps & {
  /** How to handle stacking with other modals. 'push' stacks on top, 'replace' replaces. Defaults to 'replace'. */
  stackBehavior?: 'push' | 'replace';
  /** Whether to animate on mount. Defaults to false for instant appearance. */
  animateOnMount?: boolean;
  /** Footer content that stays fixed at the bottom of the visible sheet area */
  footer?: React.ReactNode;
  /** Callback when snap index changes (not called when closing) */
  onSnapIndexChange?: (index: number) => void;
};

/**
 * A bottom sheet that renders at the root level via BottomSheetModalProvider.
 * Use this when you need the sheet to appear over tab bars and other navigators.
 *
 * @remarks
 * Requires BottomSheetModalProvider to be wrapped at the app root.
 *
 * @example
 * ```tsx
 * <BottomSheetModal open={isOpen} onOpenChange={setIsOpen}>
 *   <BottomSheetHeader>
 *     <BottomSheetTitle>Title</BottomSheetTitle>
 *   </BottomSheetHeader>
 *   <BottomSheetBody>
 *     <Text>Content here</Text>
 *   </BottomSheetBody>
 * </BottomSheetModal>
 * ```
 */
const BottomSheetModal = React.forwardRef<GorhomBottomSheetModal, BottomSheetModalProps>(
  (
    {
      open,
      onOpenChange,
      snapPoints = DEFAULT_MODAL_SNAP_POINTS,
      initialSnapIndex = 0,
      enableDynamicSizing = false,
      closeOnBackdropPress = true,
      enablePanDownToClose = true,
      stackBehavior = 'replace',
      animateOnMount = false,
      footer,
      onSnapIndexChange,
      children,
    },
    ref
  ) => {
    const internalRef = React.useRef<GorhomBottomSheetModal>(null);
    const sheetRef = ref ? (ref as React.RefObject<GorhomBottomSheetModal>) : internalRef;
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getIOSSheetColors(colorScheme);

    // Handle open/close state changes
    React.useEffect(() => {
      // Use requestAnimationFrame to ensure the ref is set after mount
      const frame = requestAnimationFrame(() => {
        if (open) {
          sheetRef.current?.present();
        } else {
          sheetRef.current?.dismiss();
        }
      });
      return () => cancelAnimationFrame(frame);
    }, [open, sheetRef]);

    // Handle sheet state changes
    const handleSheetChanges = React.useCallback(
      (index: number) => {
        if (index === -1) {
          onOpenChange(false);
        } else {
          onSnapIndexChange?.(index);
        }
      },
      [onOpenChange, onSnapIndexChange]
    );

    // Handle dismiss
    const handleDismiss = React.useCallback(() => {
      onOpenChange(false);
    }, [onOpenChange]);

    // Custom backdrop with fade animation
    const renderBackdrop = React.useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={closeOnBackdropPress ? 'close' : 'none'}
          opacity={0.5}
        />
      ),
      [closeOnBackdropPress]
    );

    // Render fixed footer using gorhom's footer component
    const renderFooter = React.useCallback(
      (props: GorhomBottomSheetFooterProps) => {
        if (!footer) return null;
        return (
          <GorhomBottomSheetFooter {...props}>
            <View
              className={cn(Platform.OS !== 'web' && 'dark')}
              style={{
                padding: 16,
                paddingBottom: 16 + insets.bottom,
                backgroundColor: colors.background,
                borderTopWidth: 0.5,
                borderTopColor: colors.separator,
              }}
            >
              {footer}
            </View>
          </GorhomBottomSheetFooter>
        );
      },
      [footer, insets.bottom, colors]
    );

    return (
      <GorhomBottomSheetModal
        ref={sheetRef}
        index={initialSnapIndex}
        snapPoints={enableDynamicSizing ? undefined : snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        stackBehavior={stackBehavior}
        animateOnMount={animateOnMount}
        onChange={handleSheetChanges}
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        footerComponent={footer ? renderFooter : undefined}
        // Keyboard handling - extend sheet when keyboard opens
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={{
          backgroundColor: colors.grabber,
          width: 36,
          height: 5,
        }}
        backgroundStyle={{
          backgroundColor: colors.background,
        }}
        style={{
          zIndex: 1000,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 1000,
        }}
      >
        {/* Wrapper View to apply dark mode class on native platforms. */}
        <View className={cn(Platform.OS !== 'web' && 'dark', 'flex-1')}>
          {children}
        </View>
      </GorhomBottomSheetModal>
    );
  }
);

BottomSheetModal.displayName = 'BottomSheetModal';

// ============================================================================
// Persistent Variant (no backdrop, stays visible, non-modal)
// ============================================================================

type PersistentBottomSheetProps = {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Snap points as percentages or pixel values. Defaults to ['50%', '90%'] */
  snapPoints?: (string | number)[];
  /** Index to snap to when opened. Defaults to 0 (first snap point) */
  snapIndex?: number;
  /** Callback when snap index changes */
  onSnapIndexChange?: (index: number) => void;
  /** Whether to enable pan down to close. Defaults to true */
  enablePanDownToClose?: boolean;
  /** Bottom inset to offset sheet from bottom of screen (e.g., for tab bar) */
  bottomInset?: number;
  /** Optional key to force re-snap when content changes but snap point stays same */
  contentKey?: string | number;
  /** Footer content that stays fixed at the bottom of the visible sheet area */
  footer?: React.ReactNode;
  /** Children content */
  children: React.ReactNode;
};

/**
 * A persistent bottom sheet without backdrop, designed for map-first interfaces.
 * The sheet floats over content without blocking interactions with the background.
 *
 * @remarks
 * - No backdrop - content behind remains interactive
 * - Non-modal - doesn't capture focus
 * - Perfect for Find My-style map interfaces
 * - Supports pan-to-dismiss gesture
 *
 * @example
 * ```tsx
 * <PersistentBottomSheet
 *   open={isSheetOpen}
 *   onOpenChange={setIsSheetOpen}
 *   snapPoints={[180, '50%', '90%']}
 *   snapIndex={currentSnapIndex}
 *   onSnapIndexChange={setCurrentSnapIndex}
 * >
 *   <BottomSheetScrollBody>
 *     <Text>Sheet content</Text>
 *   </BottomSheetScrollBody>
 * </PersistentBottomSheet>
 * ```
 */
const PersistentBottomSheet = React.forwardRef<GorhomBottomSheet, PersistentBottomSheetProps>(
  (
    {
      open,
      onOpenChange,
      snapPoints = DEFAULT_MODAL_SNAP_POINTS,
      snapIndex = 0,
      onSnapIndexChange,
      enablePanDownToClose = true,
      bottomInset = 0,
      contentKey,
      footer,
      children,
    },
    ref
  ) => {
    const internalRef = React.useRef<GorhomBottomSheet>(null);
    const sheetRef = (ref as React.RefObject<GorhomBottomSheet>) || internalRef;
    const isClosingRef = React.useRef(false);
    const prevContentKeyRef = React.useRef(contentKey);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = getIOSSheetColors(colorScheme);

    // Handle open/close state changes and content key changes
    React.useEffect(() => {
      const contentKeyChanged = contentKey !== prevContentKeyRef.current;
      prevContentKeyRef.current = contentKey;

      // Use requestAnimationFrame to ensure ref is set after mount
      const frame = requestAnimationFrame(() => {
        if (open) {
          isClosingRef.current = false;
          // Snap when opening OR when contentKey changes (e.g., switching between pins)
          sheetRef.current?.snapToIndex(snapIndex);
        } else {
          isClosingRef.current = true;
          sheetRef.current?.close();
        }
      });

      return () => cancelAnimationFrame(frame);
    }, [open, snapIndex, contentKey, sheetRef]);

    // Handle sheet state changes
    const handleSheetChanges = React.useCallback(
      (index: number) => {
        if (index === -1) {
          // Only notify if this was a user-initiated close (not programmatic)
          if (!isClosingRef.current) {
            onOpenChange(false);
          }
        } else {
          onSnapIndexChange?.(index);
        }
      },
      [onOpenChange, onSnapIndexChange]
    );

    // Render fixed footer using gorhom's footer component
    const renderFooter = React.useCallback(
      (props: GorhomBottomSheetFooterProps) => {
        if (!footer) return null;
        return (
          <GorhomBottomSheetFooter {...props} bottomInset={bottomInset}>
            <View
              className={cn(Platform.OS !== 'web' && 'dark')}
              style={{
                padding: 16,
                paddingBottom: bottomInset > 0 ? 16 : 16 + insets.bottom,
                backgroundColor: colors.background,
                borderTopWidth: 0.5,
                borderTopColor: colors.separator,
              }}
            >
              {footer}
            </View>
          </GorhomBottomSheetFooter>
        );
      },
      [footer, bottomInset, insets.bottom, colors]
    );

    return (
      <GorhomBottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        onChange={handleSheetChanges}
        bottomInset={bottomInset}
        // No backdrop for persistent sheets
        backdropComponent={undefined}
        footerComponent={footer ? renderFooter : undefined}
        // Keyboard handling - extend sheet when keyboard opens
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={{
          backgroundColor: colors.grabber,
          width: 36,
          height: 5,
        }}
        backgroundStyle={{
          backgroundColor: colors.background,
        }}
        containerStyle={{
          zIndex: 100,
          elevation: 100,
        }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        {/* Wrapper View to apply dark mode class on native platforms. */}
        <View className={cn(Platform.OS !== 'web' && 'dark', 'flex-1')}>
          {children}
        </View>
      </GorhomBottomSheet>
    );
  }
);

PersistentBottomSheet.displayName = 'PersistentBottomSheet';

export {
  BottomSheet,
  BottomSheetModal,
  PersistentBottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
  BottomSheetScrollBody,
  BottomSheetFooter,
  // Native sheet components (for iOS formSheet modals)
  NativeSheetHeader,
  NativeSheetScrollBody,
  NativeSheetFooter,
  // Re-export gorhom primitives for advanced use cases
  BottomSheetFlatList,
  BottomSheetSectionList,
};

export type {
  BottomSheetProps,
  BottomSheetModalProps,
  PersistentBottomSheetProps,
  BottomSheetHeaderProps,
  BottomSheetTitleProps,
  BottomSheetBodyProps,
  BottomSheetScrollBodyProps,
  BottomSheetFooterProps,
  NativeSheetHeaderProps,
  NativeSheetScrollBodyProps,
  NativeSheetFooterProps,
};
