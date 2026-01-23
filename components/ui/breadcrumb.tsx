import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { ChevronRight, MoreHorizontal, type LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// ============================================================================
// Context
// ============================================================================

type BreadcrumbContextValue = {
  separator?: React.ReactNode;
};

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({});

const useBreadcrumb = () => React.useContext(BreadcrumbContext);

// ============================================================================
// Breadcrumb (Root)
// ============================================================================

type BreadcrumbProps = React.ComponentProps<typeof View> & {
  /** Custom separator for all BreadcrumbSeparators */
  separator?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Navigation wrapper with context provider for breadcrumb trail.
 */
const Breadcrumb = React.forwardRef<View, BreadcrumbProps>(
  ({ separator, children, ...props }, ref) => {
    const contextValue = React.useMemo(() => ({ separator }), [separator]);

    return (
      <BreadcrumbContext.Provider value={contextValue}>
        <View
          ref={ref}
          accessibilityLabel="breadcrumb"
          {...(Platform.OS === 'web' ? { role: 'navigation', 'aria-label': 'breadcrumb' } : null)}
          {...props}
        >
          {children}
        </View>
      </BreadcrumbContext.Provider>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

// ============================================================================
// BreadcrumbList
// ============================================================================

type BreadcrumbListProps = React.ComponentProps<typeof View> & {
  /** Auto-collapse when items exceed this count */
  maxItems?: number;
  /** Props passed to the auto-collapsed ellipsis */
  ellipsisProps?: Omit<BreadcrumbEllipsisProps, 'children'>;
  children?: React.ReactNode;
};

/**
 * Check if child is a BreadcrumbItem by displayName
 */
function isBreadcrumbItem(child: React.ReactNode): child is React.ReactElement {
  if (!React.isValidElement(child)) return false;
  const type = child.type as { displayName?: string };
  return type.displayName === 'BreadcrumbItem';
}

/**
 * Check if child is a BreadcrumbSeparator by displayName
 */
function isBreadcrumbSeparator(child: React.ReactNode): child is React.ReactElement {
  if (!React.isValidElement(child)) return false;
  const type = child.type as { displayName?: string };
  return type.displayName === 'BreadcrumbSeparator';
}

/**
 * Collapse children when exceeding maxItems.
 * Keeps first item, inserts ellipsis, then shows last (maxItems - 2) items.
 */
function collapseChildren(
  children: React.ReactNode,
  maxItems: number,
  ellipsisProps?: Omit<BreadcrumbEllipsisProps, 'children'>
): React.ReactNode {
  const items: { item: React.ReactElement; separator?: React.ReactElement }[] = [];

  // Parse children into item/separator pairs
  const forEachChild = (nodes: React.ReactNode, fn: (child: React.ReactNode) => void) => {
    React.Children.forEach(nodes, (child) => {
      if (React.isValidElement(child) && child.type === React.Fragment) {
        const fragmentChild = child as React.ReactElement<{ children?: React.ReactNode }>;
        forEachChild(fragmentChild.props.children, fn);
        return;
      }
      fn(child);
    });
  };

  forEachChild(children, (child) => {
    if (isBreadcrumbItem(child)) {
      items.push({ item: child });
    } else if (isBreadcrumbSeparator(child) && items.length > 0) {
      items[items.length - 1].separator = child;
    }
  });

  // If no collapse needed, return original
  if (items.length <= maxItems) return children;

  // Ensure we have at least 3 items for collapse to make sense (first, ellipsis, last)
  if (maxItems < 2) return children;

  // Build collapsed array: [first] + [ellipsis] + [last (maxItems-2)]
  const first = items[0];
  const lastCount = maxItems - 2;
  const lastItems = lastCount > 0 ? items.slice(-lastCount) : [];
  const lastStartIndex = items.length - lastItems.length;
  const separatorBeforeLast = lastItems.length > 0 ? items[lastStartIndex - 1]?.separator : undefined;

  const ellipsisItem = {
    item: (
      <BreadcrumbItem key="__breadcrumb-ellipsis__">
        <BreadcrumbEllipsis {...ellipsisProps} />
      </BreadcrumbItem>
    ),
    separator: separatorBeforeLast
      ? React.cloneElement(separatorBeforeLast, { key: '__breadcrumb-ellipsis-sep__' })
      : undefined,
  };

  const collapsed = [first, ellipsisItem, ...lastItems];

  return collapsed.flatMap(({ item, separator }, index) => {
    // Clone items with stable keys
    const clonedItem = React.cloneElement(item, {
      key: item.key ?? `breadcrumb-item-${index}`,
    });
    if (separator) {
      const clonedSeparator = React.cloneElement(separator, {
        key: separator.key ?? `breadcrumb-sep-${index}`,
      });
      return [clonedItem, clonedSeparator];
    }
    return [clonedItem];
  });
}

/**
 * Container for breadcrumb items with optional auto-collapse logic.
 */
const BreadcrumbList = React.forwardRef<View, BreadcrumbListProps>(
  ({ className, maxItems, ellipsisProps, children, ...props }, ref) => {
    const processedChildren =
      maxItems !== undefined ? collapseChildren(children, maxItems, ellipsisProps) : children;

    return (
      <View
        ref={ref}
        className={cn('flex flex-row flex-wrap items-center gap-1.5 sm:gap-2.5', className)}
        {...(Platform.OS === 'web' ? { role: 'list' } : null)}
        {...props}
      >
        {processedChildren}
      </View>
    );
  }
);

BreadcrumbList.displayName = 'BreadcrumbList';

// ============================================================================
// BreadcrumbItem
// ============================================================================

type BreadcrumbItemProps = React.ComponentProps<typeof View>;

/**
 * Individual item wrapper in the breadcrumb trail.
 */
const BreadcrumbItem = React.forwardRef<View, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('flex flex-row items-center gap-1.5', className)}
        {...(Platform.OS === 'web' ? { role: 'listitem' } : null)}
        {...props}
      />
    );
  }
);

BreadcrumbItem.displayName = 'BreadcrumbItem';

// ============================================================================
// BreadcrumbLink
// ============================================================================

type BreadcrumbLinkProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  /** Use Slot for custom component */
  asChild?: boolean;
  /** Optional icon to display before children */
  icon?: LucideIcon;
  /** Content to display (text, etc.) */
  children?: React.ReactNode;
};

// Base text styles
const LINK_TEXT_STYLES = 'text-sm text-muted-foreground';

// Web-specific styles for hover and focus
const LINK_WEB_STYLES =
  'flex-row items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

// Native styles for layout
const LINK_NATIVE_STYLES = 'flex-row items-center gap-1.5';

/**
 * Clickable link within a breadcrumb item.
 */
const BreadcrumbLink = React.forwardRef<View, BreadcrumbLinkProps>(
  ({ className, asChild, icon, children, ...props }, ref) => {
    const Component = asChild ? Slot.Pressable : Pressable;
    const isNative = Platform.OS !== 'web';

    return (
      <TextClassContext.Provider value={LINK_TEXT_STYLES}>
        <Component
          ref={ref}
          accessibilityRole="link"
          className={cn(
            Platform.select({ web: LINK_WEB_STYLES, default: LINK_NATIVE_STYLES }),
            className
          )}
          style={isNative ? ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 }) : undefined}
          {...props}
        >
          {icon && <Icon as={icon} size={14} className="text-muted-foreground" />}
          {children}
        </Component>
      </TextClassContext.Provider>
    );
  }
);

BreadcrumbLink.displayName = 'BreadcrumbLink';

// ============================================================================
// BreadcrumbPage
// ============================================================================

type BreadcrumbPageProps = React.ComponentProps<typeof View> & {
  children: React.ReactNode;
  /** Optional icon to display before children */
  icon?: LucideIcon;
};

// Page text styles (current page, non-interactive)
const PAGE_TEXT_STYLES = 'text-sm font-normal text-foreground';

/**
 * Current page indicator (non-interactive).
 */
const BreadcrumbPage = React.forwardRef<View, BreadcrumbPageProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <TextClassContext.Provider value={PAGE_TEXT_STYLES}>
        <View
          ref={ref}
          accessibilityRole="link"
          accessibilityState={{ disabled: true }}
          className={cn('flex flex-row items-center gap-1.5', className)}
          {...(Platform.OS === 'web'
            ? { role: 'link', 'aria-disabled': true, 'aria-current': 'page' }
            : null)}
          {...props}
        >
          {icon && <Icon as={icon} size={14} className="text-foreground" />}
          {children}
        </View>
      </TextClassContext.Provider>
    );
  }
);

BreadcrumbPage.displayName = 'BreadcrumbPage';

// ============================================================================
// BreadcrumbSeparator
// ============================================================================

type BreadcrumbSeparatorProps = React.ComponentProps<typeof View> & {
  /** Override default ChevronRight separator */
  children?: React.ReactNode;
};

/**
 * Visual divider between breadcrumb items.
 * Uses custom children, context separator, or default ChevronRight.
 */
const BreadcrumbSeparator = React.forwardRef<View, BreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => {
    const { separator } = useBreadcrumb();

    // Priority: children > context separator > default ChevronRight
    const content = children ?? separator ?? (
      <Icon as={ChevronRight} size={14} className="text-muted-foreground" />
    );

    return (
      <View
        ref={ref}
        accessible={false}
        importantForAccessibility="no"
        aria-hidden={Platform.OS === 'web' ? true : undefined}
        className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
        {...props}
      >
        {content}
      </View>
    );
  }
);

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// ============================================================================
// BreadcrumbEllipsis
// ============================================================================

type BreadcrumbEllipsisProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  /** Future: trigger ActionSheet */
  onPress?: () => void;
};

/**
 * Collapsed items indicator (ellipsis).
 */
const BreadcrumbEllipsis = React.forwardRef<View, BreadcrumbEllipsisProps>(
  ({ className, onPress, disabled, ...props }, ref) => {
    const isNative = Platform.OS !== 'web';
    const isDisabled = !onPress || !!disabled;

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        className={cn('flex h-9 w-9 items-center justify-center', className)}
        accessibilityLabel="More"
        style={isNative ? ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 }) : undefined}
        {...(Platform.OS === 'web'
          ? { role: 'button', 'aria-disabled': isDisabled, tabIndex: isDisabled ? -1 : 0 }
          : null)}
        {...props}
      >
        <Icon
          as={MoreHorizontal}
          size={16}
          className="text-muted-foreground"
        />
      </Pressable>
    );
  }
);

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// ============================================================================
// Exports
// ============================================================================

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

export type {
  BreadcrumbProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbEllipsisProps,
};
