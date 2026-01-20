import { buttonTextVariants, buttonVariants } from '@/components/ui/button';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Animation timing for overlay and content transitions
const OVERLAY_FADE_IN_DURATION_MS = 200;
const OVERLAY_FADE_IN_DELAY_MS = 50;
const OVERLAY_FADE_OUT_DURATION_MS = 150;

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

type AlertDialogOverlayProps = Omit<AlertDialogPrimitive.OverlayProps, 'asChild'> & {
  children?: React.ReactNode;
};

const AlertDialogOverlay = React.forwardRef<
  AlertDialogPrimitive.OverlayRef,
  AlertDialogOverlayProps
>(({ className, children, ...props }, ref) => {
  return (
    <FullWindowOverlay>
      <AlertDialogPrimitive.Overlay
        ref={ref}
        className={cn(
          'absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/50 p-2',
          Platform.select({
            web: 'animate-in fade-in-0 fixed',
          }),
          className
        )}
        {...props}>
        <NativeOnlyAnimatedView
          entering={FadeIn.duration(OVERLAY_FADE_IN_DURATION_MS).delay(OVERLAY_FADE_IN_DELAY_MS)}
          exiting={FadeOut.duration(OVERLAY_FADE_OUT_DURATION_MS)}>
          {children}
        </NativeOnlyAnimatedView>
      </AlertDialogPrimitive.Overlay>
    </FullWindowOverlay>
  );
});

AlertDialogOverlay.displayName = 'AlertDialogOverlay';

type AlertDialogContentProps = AlertDialogPrimitive.ContentProps & {
  portalHost?: string;
};

const AlertDialogContent = React.forwardRef<
  AlertDialogPrimitive.ContentRef,
  AlertDialogContentProps
>(({ className, portalHost, ...props }, ref) => {
  return (
    <AlertDialogPortal hostName={portalHost}>
      <AlertDialogOverlay>
        <AlertDialogPrimitive.Content
          ref={ref}
          className={cn(
            'bg-background border-border z-50 flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border p-6 shadow-lg shadow-black/5 sm:max-w-lg',
            Platform.select({
              web: 'animate-in fade-in-0 zoom-in-95 duration-200',
            }),
            className
          )}
          {...props}
        />
      </AlertDialogOverlay>
    </AlertDialogPortal>
  );
});

AlertDialogContent.displayName = 'AlertDialogContent';

type AlertDialogHeaderProps = ViewProps;

const AlertDialogHeader = React.forwardRef<View, AlertDialogHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextClassContext.Provider value="text-center sm:text-left">
        <View ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
      </TextClassContext.Provider>
    );
  }
);

AlertDialogHeader.displayName = 'AlertDialogHeader';

type AlertDialogFooterProps = ViewProps;

const AlertDialogFooter = React.forwardRef<View, AlertDialogFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
        {...props}
      />
    );
  }
);

AlertDialogFooter.displayName = 'AlertDialogFooter';

type AlertDialogTitleProps = AlertDialogPrimitive.TitleProps;

const AlertDialogTitle = React.forwardRef<AlertDialogPrimitive.TitleRef, AlertDialogTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <AlertDialogPrimitive.Title
        ref={ref}
        className={cn('text-foreground text-lg font-semibold', className)}
        {...props}
      />
    );
  }
);

AlertDialogTitle.displayName = 'AlertDialogTitle';

type AlertDialogDescriptionProps = AlertDialogPrimitive.DescriptionProps;

const AlertDialogDescription = React.forwardRef<
  AlertDialogPrimitive.DescriptionRef,
  AlertDialogDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
});

AlertDialogDescription.displayName = 'AlertDialogDescription';

type AlertDialogActionProps = AlertDialogPrimitive.ActionProps;

const AlertDialogAction = React.forwardRef<AlertDialogPrimitive.ActionRef, AlertDialogActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextClassContext.Provider value={buttonTextVariants({ className })}>
        <AlertDialogPrimitive.Action
          ref={ref}
          className={cn(buttonVariants(), className)}
          {...props}
        />
      </TextClassContext.Provider>
    );
  }
);

AlertDialogAction.displayName = 'AlertDialogAction';

type AlertDialogCancelProps = AlertDialogPrimitive.CancelProps;

const AlertDialogCancel = React.forwardRef<AlertDialogPrimitive.CancelRef, AlertDialogCancelProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextClassContext.Provider value={buttonTextVariants({ className, variant: 'outline' })}>
        <AlertDialogPrimitive.Cancel
          ref={ref}
          className={cn(buttonVariants({ variant: 'outline' }), className)}
          {...props}
        />
      </TextClassContext.Provider>
    );
  }
);

AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};

export type {
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogContentProps,
  AlertDialogDescriptionProps,
  AlertDialogFooterProps,
  AlertDialogHeaderProps,
  AlertDialogOverlayProps,
  AlertDialogTitleProps,
};
