import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import * as React from 'react';
import {
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Re-export primitives with displayName for debugging
const DropdownMenu = DropdownMenuPrimitive.Root;
DropdownMenu.displayName = 'DropdownMenu';

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuGroup = DropdownMenuPrimitive.Group;
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;
DropdownMenuSub.displayName = 'DropdownMenuSub';

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

// iOS full window overlay for proper z-index handling
const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

// Variant styles for menu items
const dropdownMenuItemVariants = cva(
  'group relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 active:bg-accent sm:py-1.5',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'active:bg-destructive/10 dark:active:bg-destructive/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Text styles for menu items by variant
const ITEM_TEXT_STYLES = {
  default: 'select-none text-sm text-popover-foreground group-active:text-popover-foreground',
  destructive:
    'select-none text-sm text-destructive group-active:text-destructive',
} as const;

type DropdownMenuSubTriggerProps = DropdownMenuPrimitive.SubTriggerProps & {
  children?: React.ReactNode;
  iconClassName?: string;
  inset?: boolean;
};

const DropdownMenuSubTrigger = React.forwardRef<
  DropdownMenuPrimitive.SubTriggerRef,
  DropdownMenuSubTriggerProps
>(({ className, inset, children, iconClassName, ...props }, ref) => {
  const { open } = DropdownMenuPrimitive.useSubContext();
  const icon = Platform.OS === 'web' ? ChevronRight : open ? ChevronUp : ChevronDown;
  return (
    <TextClassContext.Provider
      value={cn(
        'text-sm select-none group-active:text-accent-foreground',
        open && 'text-accent-foreground'
      )}>
      <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
          'group flex flex-row items-center rounded-sm px-2 py-2 active:bg-accent sm:py-1.5',
          Platform.select({
            web: 'cursor-default outline-none focus:bg-accent focus:text-accent-foreground [&_svg]:pointer-events-none',
          }),
          open && 'bg-accent',
          inset && 'pl-8',
          className
        )}
        {...props}>
        <>{children}</>
        <Icon as={icon} className={cn('ml-auto size-4 shrink-0 text-foreground', iconClassName)} />
      </DropdownMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  );
});

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

type DropdownMenuSubContentProps = DropdownMenuPrimitive.SubContentProps;

const DropdownMenuSubContent = React.forwardRef<
  DropdownMenuPrimitive.SubContentRef,
  DropdownMenuSubContentProps
>(({ className, ...props }, ref) => {
  return (
    <NativeOnlyAnimatedView entering={FadeIn}>
      <DropdownMenuPrimitive.SubContent
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

DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

type DropdownMenuContentProps = DropdownMenuPrimitive.ContentProps & {
  overlayStyle?: StyleProp<ViewStyle>;
  overlayClassName?: string;
  portalHost?: string;
};

const DropdownMenuContent = React.forwardRef<
  DropdownMenuPrimitive.ContentRef,
  DropdownMenuContentProps
>(({ className, overlayClassName, overlayStyle, portalHost, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <DropdownMenuPrimitive.Overlay
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
              <DropdownMenuPrimitive.Content
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
        </DropdownMenuPrimitive.Overlay>
      </FullWindowOverlay>
    </DropdownMenuPrimitive.Portal>
  );
});

DropdownMenuContent.displayName = 'DropdownMenuContent';

type DropdownMenuItemProps = DropdownMenuPrimitive.ItemProps &
  VariantProps<typeof dropdownMenuItemVariants> & {
    className?: string;
    inset?: boolean;
  };

const DropdownMenuItem = React.forwardRef<
  DropdownMenuPrimitive.ItemRef,
  DropdownMenuItemProps
>(({ className, inset, variant = 'default', ...props }, ref) => {
  const children = props.children;
  return (
    <TextClassContext.Provider value={ITEM_TEXT_STYLES[variant ?? 'default']}>
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(
          dropdownMenuItemVariants({ variant }),
          Platform.select({
            web: cn(
              'cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none',
              variant === 'destructive' && 'focus:bg-destructive/10 dark:focus:bg-destructive/20'
            ),
          }),
          props.disabled && 'opacity-50',
          inset && 'pl-8',
          className
        )}
        {...props}>
        {typeof children === 'function' ? children : wrapTextChildren(children)}
      </DropdownMenuPrimitive.Item>
    </TextClassContext.Provider>
  );
});

DropdownMenuItem.displayName = 'DropdownMenuItem';

type DropdownMenuCheckboxItemProps = DropdownMenuPrimitive.CheckboxItemProps & {
  children?: React.ReactNode;
};

const DropdownMenuCheckboxItem = React.forwardRef<
  DropdownMenuPrimitive.CheckboxItemRef,
  DropdownMenuCheckboxItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <TextClassContext.Provider value="text-sm text-popover-foreground select-none group-active:text-accent-foreground">
      <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
          'group relative flex flex-row items-center gap-2 rounded-sm py-2 pl-8 pr-2 active:bg-accent sm:py-1.5',
          Platform.select({
            web: 'cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none',
          }),
          props.disabled && 'opacity-50',
          className
        )}
        {...props}>
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <Icon
              as={Check}
              className={cn(
                'size-4 text-foreground',
                Platform.select({ web: 'pointer-events-none' })
              )}
            />
          </DropdownMenuPrimitive.ItemIndicator>
        </View>
        {wrapTextChildren(children)}
      </DropdownMenuPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  );
});

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

type DropdownMenuRadioItemProps = DropdownMenuPrimitive.RadioItemProps & {
  children?: React.ReactNode;
};

const DropdownMenuRadioItem = React.forwardRef<
  DropdownMenuPrimitive.RadioItemRef,
  DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <TextClassContext.Provider value="text-sm text-popover-foreground select-none group-active:text-accent-foreground">
      <DropdownMenuPrimitive.RadioItem
        ref={ref}
        className={cn(
          'group relative flex flex-row items-center gap-2 rounded-sm py-2 pl-8 pr-2 active:bg-accent sm:py-1.5',
          Platform.select({
            web: 'cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none',
          }),
          props.disabled && 'opacity-50',
          className
        )}
        {...props}>
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <View className="h-2 w-2 rounded-full bg-foreground" />
          </DropdownMenuPrimitive.ItemIndicator>
        </View>
        {wrapTextChildren(children)}
      </DropdownMenuPrimitive.RadioItem>
    </TextClassContext.Provider>
  );
});

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

type DropdownMenuLabelProps = DropdownMenuPrimitive.LabelProps & {
  className?: string;
  inset?: boolean;
};

const DropdownMenuLabel = React.forwardRef<
  DropdownMenuPrimitive.LabelRef,
  DropdownMenuLabelProps
>(({ className, inset, children, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        'px-2 py-2 text-sm font-medium text-foreground sm:py-1.5',
        inset && 'pl-8',
        className
      )}
      {...props}>
      {wrapTextChildren(children)}
    </DropdownMenuPrimitive.Label>
  );
});

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

type DropdownMenuSeparatorProps = DropdownMenuPrimitive.SeparatorProps;

const DropdownMenuSeparator = React.forwardRef<
  DropdownMenuPrimitive.SeparatorRef,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

type DropdownMenuShortcutProps = TextProps;

const DropdownMenuShortcut = React.forwardRef<Text, DropdownMenuShortcutProps>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
        {...props}
      />
    );
  }
);

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  dropdownMenuItemVariants,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};

export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuShortcutProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubTriggerProps,
};
