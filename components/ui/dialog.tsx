import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { Text, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Animation timing for dialog transitions
const FADE_IN_DURATION_MS = 200;
const FADE_OUT_DURATION_MS = 150;
const CONTENT_FADE_DELAY_MS = 50;

// Touch target expansion for close button
const CLOSE_BUTTON_HIT_SLOP = 12;

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

type DialogOverlayProps = Omit<DialogPrimitive.OverlayProps, 'asChild'> & {
  children?: React.ReactNode;
};

const DialogOverlay = React.forwardRef<DialogPrimitive.OverlayRef, DialogOverlayProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <FullWindowOverlay>
        <DialogPrimitive.Overlay
          ref={ref}
          className={cn(
            'absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black/50 p-2',
            Platform.select({
              web: 'animate-in fade-in-0 fixed cursor-default [&>*]:cursor-auto',
            }),
            className
          )}
          {...props}
          asChild={Platform.OS !== 'web'}>
          <NativeOnlyAnimatedView
            entering={FadeIn.duration(FADE_IN_DURATION_MS)}
            exiting={FadeOut.duration(FADE_OUT_DURATION_MS)}>
            <NativeOnlyAnimatedView
              entering={FadeIn.delay(CONTENT_FADE_DELAY_MS)}
              exiting={FadeOut.duration(FADE_OUT_DURATION_MS)}>
              <>{children}</>
            </NativeOnlyAnimatedView>
          </NativeOnlyAnimatedView>
        </DialogPrimitive.Overlay>
      </FullWindowOverlay>
    );
  }
);

DialogOverlay.displayName = 'DialogOverlay';

type DialogContentProps = DialogPrimitive.ContentProps & {
  portalHost?: string;
  showCloseButton?: boolean;
  /** Custom className for the overlay (use to change positioning, e.g., items-start for top alignment) */
  overlayClassName?: string;
};

const DialogContent = React.forwardRef<DialogPrimitive.ContentRef, DialogContentProps>(
  ({ className, portalHost, children, showCloseButton = true, overlayClassName, ...props }, ref) => {
    return (
      <DialogPortal hostName={portalHost}>
        <DialogOverlay className={overlayClassName}>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'bg-background border-border z-50 mx-auto flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border p-6 shadow-lg shadow-black/5 sm:max-w-lg',
              Platform.select({
                web: 'animate-in fade-in-0 zoom-in-95 duration-200',
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
                    web: 'ring-offset-background focus:ring-ring data-[state=open]:bg-accent transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
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
        </DialogOverlay>
      </DialogPortal>
    );
  }
);

DialogContent.displayName = 'DialogContent';

type DialogHeaderProps = React.ComponentProps<typeof View>;

const DialogHeader = React.forwardRef<View, DialogHeaderProps>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
});

DialogHeader.displayName = 'DialogHeader';

type DialogFooterProps = React.ComponentProps<typeof View>;

const DialogFooter = React.forwardRef<View, DialogFooterProps>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
});

DialogFooter.displayName = 'DialogFooter';

type DialogTitleProps = DialogPrimitive.TitleProps;

const DialogTitle = React.forwardRef<DialogPrimitive.TitleRef, DialogTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <DialogPrimitive.Title
        ref={ref}
        className={cn('text-foreground text-lg font-semibold leading-none', className)}
        {...props}>
        {wrapTextChildren(children)}
      </DialogPrimitive.Title>
    );
  }
);

DialogTitle.displayName = 'DialogTitle';

type DialogDescriptionProps = DialogPrimitive.DescriptionProps;

const DialogDescription = React.forwardRef<DialogPrimitive.DescriptionRef, DialogDescriptionProps>(
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

DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

export type {
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogTitleProps,
};
