import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextClassContext, wrapTextChildren } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import { Link, usePathname, type Href } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Maximum height for scroll container
const SCROLL_MAX_HEIGHT = 320;

// Type for navigation items used in data-driven API
type NavItem = {
  label: string;
  href: Href;
  icon?: LucideIcon;
};

type NavItemGroup = {
  label?: string;
  items: NavItem[];
};

type NavMenuRootProps = DropdownMenuPrimitive.RootProps & {
  // Data-driven API props
  items?: NavItem[] | NavItemGroup[];
  title?: string;
  titleIcon?: LucideIcon;
  triggerIcon?: LucideIcon;
  // Position props for controlling where the menu opens
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  // Routing override for data-driven items
  renderItem?: (item: NavItem) => React.ReactNode;
};

/**
 * NavMenu - A navigation menu component that supports both data-driven and compound usage.
 *
 * Data-driven usage (simpler, recommended for designers):
 * ```tsx
 * <NavMenu
 *   items={[
 *     { label: 'Button', href: '/demos/button', icon: SquareIcon },
 *     { label: 'Input', href: '/demos/input', icon: TextCursorInputIcon },
 *   ]}
 *   title="Components"
 *   titleIcon={LayoutGridIcon}
 *   triggerIcon={MenuIcon}
 *   side="bottom"      // 'top' | 'bottom'
 *   align="start"      // 'start' | 'center' | 'end'
 *   sideOffset={4}     // distance from trigger in pixels
 * />
 * ```
 *
 * Compound usage (more flexible):
 * ```tsx
 * <NavMenu>
 *   <NavMenu.Trigger asChild>
 *     <Button variant="ghost" size="icon">
 *       <Icon as={MenuIcon} />
 *     </Button>
 *   </NavMenu.Trigger>
 *   <NavMenu.Content>
 *     <NavMenu.Label icon={LayoutGridIcon}>Components</NavMenu.Label>
 *     <NavMenu.Item href="/demos/button" icon={SquareIcon}>Button</NavMenu.Item>
 *     <NavMenu.Item href="/demos/input">Input</NavMenu.Item>
 *   </NavMenu.Content>
 * </NavMenu>
 * ```
 */
function NavMenu({
  items,
  title,
  titleIcon,
  triggerIcon,
  children,
  side,
  align,
  sideOffset,
  alignOffset,
  renderItem,
  ...props
}: NavMenuRootProps) {
  // Helper to check if items array contains groups
  const isGroupedItems = (arr: NavItem[] | NavItemGroup[]): arr is NavItemGroup[] => {
    return arr.length > 0 && 'items' in arr[0] && Array.isArray((arr[0] as NavItemGroup).items);
  };

  // Helper to render a single nav item (used in data-driven mode)
  const getItemKey = (href: Href): string => (typeof href === 'string' ? href : href.pathname);

  const renderNavItem = (item: NavItem) =>
    renderItem ? (
      <React.Fragment key={getItemKey(item.href)}>{renderItem(item)}</React.Fragment>
    ) : (
      <NavMenuItem key={getItemKey(item.href)} href={item.href} icon={item.icon}>
        {item.label}
      </NavMenuItem>
    );

  // Data-driven rendering
  if (items && triggerIcon) {
    return (
      <DropdownMenuPrimitive.Root {...props}>
        <NavMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Icon as={triggerIcon} />
          </Button>
        </NavMenuTrigger>
        <NavMenuContent side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
          {title && <NavMenuLabel icon={titleIcon}>{title}</NavMenuLabel>}
          {isGroupedItems(items)
            ? items.map((group, groupIndex) => (
                <React.Fragment key={group.label ?? groupIndex}>
                  {groupIndex > 0 && <NavMenuSeparator />}
                  {group.label && <NavMenuLabel>{group.label}</NavMenuLabel>}
                  {group.items.map(renderNavItem)}
                </React.Fragment>
              ))
            : items.map(renderNavItem)}
        </NavMenuContent>
      </DropdownMenuPrimitive.Root>
    );
  }

  // Compound component rendering
  return <DropdownMenuPrimitive.Root {...props}>{children}</DropdownMenuPrimitive.Root>;
}

NavMenu.displayName = 'NavMenu';

const NavMenuTrigger = DropdownMenuPrimitive.Trigger;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

type NavMenuContentProps = DropdownMenuPrimitive.ContentProps & {
  overlayStyle?: StyleProp<ViewStyle>;
  overlayClassName?: string;
  portalHost?: string;
  children?: React.ReactNode;
};

const NavMenuContent = React.forwardRef<DropdownMenuPrimitive.ContentRef, NavMenuContentProps>(
  ({ className, overlayClassName, overlayStyle, portalHost, children, ...props }, ref) => {
    const { colorScheme } = useColorScheme();

    return (
      <DropdownMenuPrimitive.Portal hostName={portalHost}>
        <FullWindowOverlay>
          <DropdownMenuPrimitive.Overlay
            style={Platform.select({
              web: overlayStyle ?? undefined,
              native: StyleSheet.flatten([StyleSheet.absoluteFill, overlayStyle]),
            })}
            className={overlayClassName}>
            {/* Wrap in View with dark class for portal content to inherit dark mode CSS variables */}
            <View className={colorScheme === 'dark' ? 'dark' : ''}>
              <NativeOnlyAnimatedView entering={FadeIn}>
                <TextClassContext.Provider value="text-popover-foreground">
                  <DropdownMenuPrimitive.Content
                    ref={ref}
                    className={cn(
                      'min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover shadow-lg shadow-black/5',
                      Platform.select({
                        web: cn(
                          'origin-(--radix-context-menu-content-transform-origin) z-50 cursor-default animate-in fade-in-0 zoom-in-95',
                          props.side === 'bottom' && 'slide-in-from-top-2',
                          props.side === 'top' && 'slide-in-from-bottom-2'
                        ),
                      }),
                      className
                    )}
                    {...props}>
                    <ScrollArea
                      maxHeight={SCROLL_MAX_HEIGHT}
                      scrollbarSize="thin"
                      bounces={false}
                      className="bg-popover"
                      viewportClassName="p-1">
                      {children}
                    </ScrollArea>
                  </DropdownMenuPrimitive.Content>
                </TextClassContext.Provider>
              </NativeOnlyAnimatedView>
            </View>
          </DropdownMenuPrimitive.Overlay>
        </FullWindowOverlay>
      </DropdownMenuPrimitive.Portal>
    );
  }
);

NavMenuContent.displayName = 'NavMenuContent';

type NavMenuItemProps = Omit<DropdownMenuPrimitive.ItemProps, 'children'> & {
  href?: Href;
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  icon?: LucideIcon;
};

const NavMenuItem = React.forwardRef<DropdownMenuPrimitive.ItemRef, NavMenuItemProps>(
  ({ href, onPress, children, className, asChild, icon, ...props }, ref) => {
    const pathname = usePathname();
    const hrefPath = href ? (typeof href === 'string' ? href : href.pathname) : null;
    const isActive = hrefPath ? pathname === hrefPath : false;

    const content = (
      <DropdownMenuPrimitive.Item
        ref={ref}
        onPress={onPress}
        className={cn(
          'group relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 sm:py-1.5',
          Platform.select({
            web: 'cursor-default outline-none focus:bg-accent focus:text-accent-foreground',
          }),
          isActive ? 'bg-accent/50' : 'active:bg-accent',
          className
        )}
        closeOnPress={true}
        {...props}>
        {icon && <Icon as={icon} size={16} />}
        {wrapTextChildren(children)}
      </DropdownMenuPrimitive.Item>
    );

    return (
      <TextClassContext.Provider
        value={cn(
          'select-none text-sm text-popover-foreground group-active:text-accent-foreground',
          isActive && 'font-medium'
        )}>
        {asChild || !href ? (
          content
        ) : (
          <Link href={href} asChild>
            {content}
          </Link>
        )}
      </TextClassContext.Provider>
    );
  }
);

NavMenuItem.displayName = 'NavMenuItem';

type NavMenuLabelProps = DropdownMenuPrimitive.LabelProps & {
  className?: string;
  children?: React.ReactNode;
  icon?: LucideIcon;
};

const NavMenuLabel = React.forwardRef<DropdownMenuPrimitive.LabelRef, NavMenuLabelProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn(
          'flex flex-row items-center gap-2 px-2 py-2 text-sm font-medium text-foreground sm:py-1.5',
          className
        )}
        {...props}>
        {icon && <Icon as={icon} size={16} />}
        {wrapTextChildren(children)}
      </DropdownMenuPrimitive.Label>
    );
  }
);

NavMenuLabel.displayName = 'NavMenuLabel';

type NavMenuSeparatorProps = DropdownMenuPrimitive.SeparatorProps & {
  className?: string;
};

const NavMenuSeparator = React.forwardRef<
  DropdownMenuPrimitive.SeparatorRef,
  NavMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
});

NavMenuSeparator.displayName = 'NavMenuSeparator';

type NavMenuGroupProps = DropdownMenuPrimitive.GroupProps & {
  label?: string;
  children?: React.ReactNode;
  className?: string;
};

const NavMenuGroup = React.forwardRef<DropdownMenuPrimitive.GroupRef, NavMenuGroupProps>(
  ({ label, children, className, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Group ref={ref} className={className} {...props}>
        {label && <NavMenuLabel>{label}</NavMenuLabel>}
        {children}
      </DropdownMenuPrimitive.Group>
    );
  }
);

NavMenuGroup.displayName = 'NavMenuGroup';

// Attach sub-components to NavMenu for compound usage
NavMenu.Trigger = NavMenuTrigger;
NavMenu.Content = NavMenuContent;
NavMenu.Item = NavMenuItem;
NavMenu.Label = NavMenuLabel;
NavMenu.Separator = NavMenuSeparator;
NavMenu.Group = NavMenuGroup;

export {
  NavMenu,
  NavMenuContent,
  NavMenuGroup,
  NavMenuItem,
  NavMenuLabel,
  NavMenuSeparator,
  NavMenuTrigger,
};
export type {
  NavItem,
  NavItemGroup,
  NavMenuContentProps,
  NavMenuGroupProps,
  NavMenuItemProps,
  NavMenuLabelProps,
  NavMenuRootProps,
  NavMenuSeparatorProps,
};
