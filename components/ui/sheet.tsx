import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { Text, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import {
  FadeIn,
  FadeOut,
  ReduceMotion,
  SlideInLeft,
  SlideInRight,
  SlideInDown,
  SlideInUp,
  SlideOutLeft,
  SlideOutRight,
  SlideOutDown,
  SlideOutUp,
} from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Animation timing for sheet transitions
const FADE_IN_DURATION_MS = 200;
const FADE_OUT_DURATION_MS = 150;
const SLIDE_DURATION_MS = 300;

// Touch target expansion for close button
const CLOSE_BUTTON_HIT_SLOP = 12;

const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetPortal = DialogPrimitive.Portal;

const SheetClose = DialogPrimitive.Close;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

type SheetOverlayProps = Omit<DialogPrimitive.OverlayProps, 'asChild'> & {
  children?: React.ReactNode;
};

const SheetOverlay = React.forwardRef<DialogPrimitive.OverlayRef, SheetOverlayProps>(
  ({ className, children, ...props }, ref) => {
    const { colorScheme } = useColorScheme();

    return (
      <FullWindowOverlay>
        {/* Wrapper View to apply dark mode class on native platforms.
            On native, the portal renders outside the main React tree,
            so we need to explicitly apply the dark class for CSS variables. */}
        <View className={cn(Platform.OS !== 'web' && colorScheme === 'dark' && 'dark', 'flex-1')}>
          <DialogPrimitive.Overlay
            ref={ref}
            className={cn(
              'absolute bottom-0 left-0 right-0 top-0 bg-black/50',
              Platform.select({
                web: 'animate-in fade-in-0 motion-reduce:animate-none fixed cursor-default [&>*]:cursor-auto',
              }),
              className
            )}
            {...props}
            asChild={Platform.OS !== 'web'}>
            <NativeOnlyAnimatedView
              entering={FadeIn.duration(FADE_IN_DURATION_MS).reduceMotion(ReduceMotion.System)}
              exiting={FadeOut.duration(FADE_OUT_DURATION_MS).reduceMotion(ReduceMotion.System)}>
              {children}
            </NativeOnlyAnimatedView>
          </DialogPrimitive.Overlay>
        </View>
      </FullWindowOverlay>
    );
  }
);

SheetOverlay.displayName = 'SheetOverlay';

// Slide animation configurations for native based on side
const slideAnimations = {
  left: { entering: SlideInLeft, exiting: SlideOutLeft },
  right: { entering: SlideInRight, exiting: SlideOutRight },
  top: { entering: SlideInUp, exiting: SlideOutUp },
  bottom: { entering: SlideInDown, exiting: SlideOutDown },
} as const;

// Web slide animation classes
const webSlideAnimations = cva('', {
  variants: {
    side: {
      left: 'slide-in-from-left',
      right: 'slide-in-from-right',
      top: 'slide-in-from-top',
      bottom: 'slide-in-from-bottom',
    },
  },
});

const sheetContentVariants = cva(
  'bg-card z-50 flex flex-col gap-4 shadow-lg',
  {
    variants: {
      side: {
        left: 'absolute bottom-0 left-0 top-0 h-full w-3/4 max-w-sm border-r border-border',
        right: 'absolute bottom-0 right-0 top-0 h-full w-3/4 max-w-sm border-l border-border',
        top: 'absolute left-0 right-0 top-0 w-full border-b border-border',
        bottom: 'absolute bottom-0 left-0 right-0 w-full border-t border-border',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

type SheetContentProps = DialogPrimitive.ContentProps &
  VariantProps<typeof sheetContentVariants> & {
    portalHost?: string;
    showCloseButton?: boolean;
    /** Close the sheet when tapping the overlay. Defaults to true for native feel. */
    closeOnOverlayPress?: boolean;
  };

const SheetContent = React.forwardRef<DialogPrimitive.ContentRef, SheetContentProps>(
  ({ className, portalHost, children, side = 'right', showCloseButton = true, closeOnOverlayPress = true, ...props }, ref) => {
    const { colorScheme } = useColorScheme();
    const sideValue = side ?? 'right';
    const animations = slideAnimations[sideValue];

    // Note: A mount delay pattern was previously used here to fix
    // "Can't perform a React state update on a component that hasn't mounted yet" error.
    // It was removed because: (1) it introduced a ~16ms delay when opening the sheet,
    // (2) React 18's concurrent mode handles these edge cases better, and
    // (3) @rn-primitives/dialog has been updated to avoid the original issue.
    // If this error resurfaces, re-add: useState(false) → useEffect(() => setIsMounted(true)) → early return null.

    return (
      <SheetPortal hostName={portalHost}>
        <SheetOverlay>
          <NativeOnlyAnimatedView
            entering={animations.entering.duration(SLIDE_DURATION_MS).reduceMotion(ReduceMotion.System)}
            exiting={animations.exiting.duration(SLIDE_DURATION_MS).reduceMotion(ReduceMotion.System)}
            className="flex-1">
            {/* Pressable overlay area - tapping closes the sheet */}
            {closeOnOverlayPress && (
              <DialogPrimitive.Close asChild>
                <Pressable
                  className="absolute inset-0"
                  accessibilityRole="button"
                  accessibilityLabel="Close sheet"
                />
              </DialogPrimitive.Close>
            )}
            <DialogPrimitive.Content
              ref={ref}
              className={cn(
                // Apply dark class directly to content for proper CSS variable inheritance on native
                Platform.OS !== 'web' && colorScheme === 'dark' && 'dark',
                sheetContentVariants({ side: sideValue }),
                Platform.select({
                  web: cn('animate-in duration-300 motion-reduce:animate-none', webSlideAnimations({ side: sideValue })),
                }),
                className
              )}
              {...props}>
              <>{children}</>
              {showCloseButton && (
                <DialogPrimitive.Close
                  className={cn(
                    'absolute right-4 top-4 rounded opacity-70 active:opacity-100',
                    Platform.select({
                      web: 'ring-offset-background focus:ring-ring transition-opacity motion-reduce:transition-none hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    })
                  )}
                  hitSlop={CLOSE_BUTTON_HIT_SLOP}>
                  <Icon
                    as={X}
                    className={cn('text-muted-foreground web:pointer-events-none size-4 shrink-0')}
                  />
                  <Text className="sr-only">Close</Text>
                </DialogPrimitive.Close>
              )}
            </DialogPrimitive.Content>
          </NativeOnlyAnimatedView>
        </SheetOverlay>
      </SheetPortal>
    );
  }
);

SheetContent.displayName = 'SheetContent';

type SheetHeaderProps = React.ComponentProps<typeof View>;

const SheetHeader = React.forwardRef<View, SheetHeaderProps>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={cn('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
});

SheetHeader.displayName = 'SheetHeader';

type SheetFooterProps = React.ComponentProps<typeof View>;

const SheetFooter = React.forwardRef<View, SheetFooterProps>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
});

SheetFooter.displayName = 'SheetFooter';

type SheetTitleProps = DialogPrimitive.TitleProps;

const SheetTitle = React.forwardRef<DialogPrimitive.TitleRef, SheetTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <DialogPrimitive.Title
        ref={ref}
        className={cn('text-foreground text-lg font-semibold', className)}
        {...props}>
        {wrapTextChildren(children)}
      </DialogPrimitive.Title>
    );
  }
);

SheetTitle.displayName = 'SheetTitle';

type SheetDescriptionProps = DialogPrimitive.DescriptionProps;

const SheetDescription = React.forwardRef<DialogPrimitive.DescriptionRef, SheetDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <DialogPrimitive.Description
        ref={ref}
        className={cn('text-muted-foreground text-sm', className)}
        {...props}>
        {wrapTextChildren(children)}
      </DialogPrimitive.Description>
    );
  }
);

SheetDescription.displayName = 'SheetDescription';

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};

export type {
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetOverlayProps,
  SheetTitleProps,
};
