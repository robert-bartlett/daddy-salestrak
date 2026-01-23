import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as ContextMenuPrimitive from '@rn-primitives/context-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import * as React from 'react';
import {
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Shared text class for menu items
const MENU_ITEM_TEXT_CLASS = 'text-sm select-none text-popover-foreground group-active:text-accent-foreground';

// Base item styles shared across menu items
const MENU_ITEM_BASE_CLASS = 'group relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 active:bg-accent sm:py-1.5';

// Web-specific focus/cursor styles for menu items
const MENU_ITEM_WEB_CLASS = 'cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none';

// Checkbox/radio item styles with left padding for indicator
const MENU_CHECKABLE_ITEM_CLASS = 'group relative flex flex-row items-center gap-2 rounded-sm py-2 pl-8 pr-2 active:bg-accent sm:py-1.5';

const ContextMenu = ContextMenuPrimitive.Root;
ContextMenu.displayName = 'ContextMenu';

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
ContextMenuTrigger.displayName = 'ContextMenuTrigger';

const ContextMenuGroup = ContextMenuPrimitive.Group;
ContextMenuGroup.displayName = 'ContextMenuGroup';

const ContextMenuSub = ContextMenuPrimitive.Sub;
ContextMenuSub.displayName = 'ContextMenuSub';

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
ContextMenuRadioGroup.displayName = 'ContextMenuRadioGroup';

type ContextMenuSubTriggerProps = ContextMenuPrimitive.SubTriggerProps & {
  children?: React.ReactNode;
  iconClassName?: string;
  inset?: boolean;
};

const ContextMenuSubTrigger = React.forwardRef<
  ContextMenuPrimitive.SubTriggerRef,
  ContextMenuSubTriggerProps
>(({ className, inset, children, iconClassName, ...props }, ref) => {
  const { open } = ContextMenuPrimitive.useSubContext();
  const ChevronIcon = Platform.OS === 'web' ? ChevronRight : open ? ChevronUp : ChevronDown;
  return (
    <TextClassContext.Provider
      value={cn(
        'text-sm select-none group-active:text-accent-foreground',
        open && 'text-accent-foreground'
      )}>
      <ContextMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
          'group flex flex-row items-center rounded-sm px-2 py-2 active:bg-accent sm:py-1.5',
          Platform.select({
            web: 'cursor-default outline-none focus:bg-accent focus:text-accent-foreground [&_svg]:pointer-events-none',
          }),
          open && cn('bg-accent', Platform.select({ native: 'mb-1' })),
          inset && 'pl-8',
          className
        )}
        {...props}>
        {wrapTextChildren(children)}
        <Icon as={ChevronIcon} className={cn('ml-auto size-4 shrink-0 text-foreground', iconClassName)} />
      </ContextMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  );
});

ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

type ContextMenuSubContentProps = ContextMenuPrimitive.SubContentProps;

const ContextMenuSubContent = React.forwardRef<
  ContextMenuPrimitive.SubContentRef,
  ContextMenuSubContentProps
>(({ className, ...props }, ref) => {
  return (
    <NativeOnlyAnimatedView entering={FadeIn}>
      <ContextMenuPrimitive.SubContent
        ref={ref}
        className={cn(
          'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg shadow-black/5',
          Platform.select({
            web: 'origin-(--radix-context-menu-content-transform-origin) z-50 min-w-[8rem] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          }),
          className
        )}
        {...props}
      />
    </NativeOnlyAnimatedView>
  );
});

ContextMenuSubContent.displayName = 'ContextMenuSubContent';

// Uses FullWindowOverlay on iOS for proper modal layering, Fragment elsewhere
const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

type ContextMenuContentProps = ContextMenuPrimitive.ContentProps & {
  overlayStyle?: StyleProp<ViewStyle>;
  overlayClassName?: string;
  portalHost?: string;
};

const ContextMenuContent = React.forwardRef<
  ContextMenuPrimitive.ContentRef,
  ContextMenuContentProps
>(({ className, overlayClassName, overlayStyle, portalHost, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <ContextMenuPrimitive.Overlay
          style={Platform.select({
            web: overlayStyle ?? undefined,
            native: overlayStyle
              ? StyleSheet.flatten([
                  StyleSheet.absoluteFill,
                  overlayStyle as typeof StyleSheet.absoluteFill,
                ])
              : StyleSheet.absoluteFill,
          })}
          className={overlayClassName}>
          <NativeOnlyAnimatedView entering={FadeIn}>
            <TextClassContext.Provider value="text-popover-foreground">
              <ContextMenuPrimitive.Content
                ref={ref}
                className={cn(
                  'min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg shadow-black/5',
                  Platform.select({
                    web: cn(
                      'max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) z-50 cursor-default animate-in fade-in-0 zoom-in-95',
                      props.side === 'bottom' && 'slide-in-from-top-2',
                      props.side === 'top' && 'slide-in-from-bottom-2'
                    ),
                  }),
                  className
                )}
                {...props}
              />
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </ContextMenuPrimitive.Overlay>
      </FullWindowOverlay>
    </ContextMenuPrimitive.Portal>
  );
});

ContextMenuContent.displayName = 'ContextMenuContent';

// Variant styles for menu item text
const contextMenuItemTextVariants = cva(
  'select-none text-sm text-popover-foreground group-active:text-accent-foreground',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive group-active:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Variant styles for menu item container
const contextMenuItemVariants = cva(MENU_ITEM_BASE_CLASS, {
  variants: {
    variant: {
      default: '',
      destructive: 'active:bg-destructive/10 dark:active:bg-destructive/20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ContextMenuItemProps = ContextMenuPrimitive.ItemProps &
  VariantProps<typeof contextMenuItemVariants> & {
    inset?: boolean;
  };

const ContextMenuItem = React.forwardRef<
  ContextMenuPrimitive.ItemRef,
  ContextMenuItemProps
>(({ className, inset, variant, ...props }, ref) => {
  const children = props.children;
  return (
    <TextClassContext.Provider value={contextMenuItemTextVariants({ variant })}>
      <ContextMenuPrimitive.Item
        ref={ref}
        className={cn(
          contextMenuItemVariants({ variant }),
          Platform.select({
            web: cn(
              MENU_ITEM_WEB_CLASS,
              variant === 'destructive' && 'focus:bg-destructive/10 dark:focus:bg-destructive/20'
            ),
          }),
          props.disabled && 'opacity-50',
          inset && 'pl-8',
          className
        )}
        {...props}>
        {typeof children === 'function' ? children : wrapTextChildren(children)}
      </ContextMenuPrimitive.Item>
    </TextClassContext.Provider>
  );
});

ContextMenuItem.displayName = 'ContextMenuItem';

type ContextMenuCheckboxItemProps = ContextMenuPrimitive.CheckboxItemProps & {
  children?: React.ReactNode;
};

const ContextMenuCheckboxItem = React.forwardRef<
  ContextMenuPrimitive.CheckboxItemRef,
  ContextMenuCheckboxItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <TextClassContext.Provider value={MENU_ITEM_TEXT_CLASS}>
      <ContextMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
          MENU_CHECKABLE_ITEM_CLASS,
          Platform.select({ web: MENU_ITEM_WEB_CLASS }),
          props.disabled && 'opacity-50',
          className
        )}
        {...props}>
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <ContextMenuPrimitive.ItemIndicator>
            <Icon
              as={Check}
              className={cn(
                'size-4 text-foreground',
                Platform.select({ web: 'pointer-events-none' })
              )}
            />
          </ContextMenuPrimitive.ItemIndicator>
        </View>
        {wrapTextChildren(children)}
      </ContextMenuPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  );
});

ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

type ContextMenuRadioItemProps = ContextMenuPrimitive.RadioItemProps & {
  children?: React.ReactNode;
};

const ContextMenuRadioItem = React.forwardRef<
  ContextMenuPrimitive.RadioItemRef,
  ContextMenuRadioItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <TextClassContext.Provider value={MENU_ITEM_TEXT_CLASS}>
      <ContextMenuPrimitive.RadioItem
        ref={ref}
        className={cn(
          MENU_CHECKABLE_ITEM_CLASS,
          Platform.select({ web: MENU_ITEM_WEB_CLASS }),
          props.disabled && 'opacity-50',
          className
        )}
        {...props}>
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <ContextMenuPrimitive.ItemIndicator>
            <View className="h-2 w-2 rounded-full bg-foreground" />
          </ContextMenuPrimitive.ItemIndicator>
        </View>
        {wrapTextChildren(children)}
      </ContextMenuPrimitive.RadioItem>
    </TextClassContext.Provider>
  );
});

ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

type ContextMenuLabelProps = ContextMenuPrimitive.LabelProps & {
  inset?: boolean;
};

const ContextMenuLabel = React.forwardRef<
  ContextMenuPrimitive.LabelRef,
  ContextMenuLabelProps
>(({ className, inset, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Label
      ref={ref}
      className={cn(
        'px-2 py-2 text-sm font-medium text-foreground sm:py-1.5',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
});

ContextMenuLabel.displayName = 'ContextMenuLabel';

type ContextMenuSeparatorProps = ContextMenuPrimitive.SeparatorProps;

const ContextMenuSeparator = React.forwardRef<
  ContextMenuPrimitive.SeparatorRef,
  ContextMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
});

ContextMenuSeparator.displayName = 'ContextMenuSeparator';

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  contextMenuItemVariants,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};

export type {
  ContextMenuCheckboxItemProps,
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuLabelProps,
  ContextMenuRadioItemProps,
  ContextMenuSeparatorProps,
  ContextMenuSubContentProps,
  ContextMenuSubTriggerProps,
};
