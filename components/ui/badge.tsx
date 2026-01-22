import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, type LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Base styles shared across all platforms
const BASE_STYLES =
  'border-border group shrink-0 flex-row items-center justify-center overflow-hidden border';

// Web-specific styles for focus, transitions, and SVG handling
const WEB_STYLES =
  'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg:not([data-badge-icon])]:pointer-events-none';

const badgeVariants = cva(
  cn(BASE_STYLES, Platform.select({ web: WEB_STYLES })),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary border-transparent',
          Platform.select({ web: '[a&]:hover:bg-primary/90' })
        ),
        secondary: cn(
          'bg-secondary border-transparent',
          Platform.select({ web: '[a&]:hover:bg-secondary/90' })
        ),
        destructive: cn(
          'bg-destructive border-transparent',
          Platform.select({ web: '[a&]:hover:bg-destructive/90' })
        ),
        outline: Platform.select({
          web: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
          default: '',
        }),
        color: '',
      },
      color: {
        grey: '',
        red: '',
        orange: '',
        yellow: '',
        'light-green': '',
        green: '',
        teal: '',
        cyan: '',
        'light-blue': '',
        blue: '',
        purple: '',
        'light-purple': '',
        violet: '',
        magenta: '',
        pink: '',
      },
      size: {
        sm: 'h-4 gap-0.5 rounded px-1.5 [&>svg:not([data-badge-icon])]:size-2.5',
        default: 'h-5 gap-1 rounded px-2 [&>svg:not([data-badge-icon])]:size-3',
        lg: 'h-6 gap-1.5 rounded-md px-2.5 [&>svg:not([data-badge-icon])]:size-3.5',
      },
    },
    compoundVariants: [
      { variant: 'color', color: 'grey', className: 'bg-grey-100 border-transparent' },
      { variant: 'color', color: 'red', className: 'bg-red-100 border-transparent' },
      { variant: 'color', color: 'orange', className: 'bg-orange-100 border-transparent' },
      { variant: 'color', color: 'yellow', className: 'bg-yellow-100 border-transparent' },
      {
        variant: 'color',
        color: 'light-green',
        className: 'bg-light-green-100 border-transparent',
      },
      { variant: 'color', color: 'green', className: 'bg-green-100 border-transparent' },
      { variant: 'color', color: 'teal', className: 'bg-teal-100 border-transparent' },
      { variant: 'color', color: 'cyan', className: 'bg-cyan-100 border-transparent' },
      {
        variant: 'color',
        color: 'light-blue',
        className: 'bg-light-blue-100 border-transparent',
      },
      { variant: 'color', color: 'blue', className: 'bg-blue-100 border-transparent' },
      { variant: 'color', color: 'purple', className: 'bg-purple-100 border-transparent' },
      {
        variant: 'color',
        color: 'light-purple',
        className: 'bg-light-purple-100 border-transparent',
      },
      { variant: 'color', color: 'violet', className: 'bg-violet-100 border-transparent' },
      { variant: 'color', color: 'magenta', className: 'bg-magenta-100 border-transparent' },
      { variant: 'color', color: 'pink', className: 'bg-pink-100 border-transparent' },
    ],
    defaultVariants: {
      variant: 'default',
      color: 'grey',
      size: 'default',
    },
  }
);

const badgeTextVariants = cva('font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      color: '',
    },
    color: {
      grey: '',
      red: '',
      orange: '',
      yellow: '',
      'light-green': '',
      green: '',
      teal: '',
      cyan: '',
      'light-blue': '',
      blue: '',
      purple: '',
      'light-purple': '',
      violet: '',
      magenta: '',
      pink: '',
    },
    size: {
      sm: 'text-[10px] leading-none',
      default: 'text-xs',
      lg: 'text-sm',
    },
  },
  compoundVariants: [
    { variant: 'color', color: 'grey', className: 'text-grey-700' },
    { variant: 'color', color: 'red', className: 'text-red-700' },
    { variant: 'color', color: 'orange', className: 'text-orange-700' },
    { variant: 'color', color: 'yellow', className: 'text-yellow-700' },
    { variant: 'color', color: 'light-green', className: 'text-light-green-700' },
    { variant: 'color', color: 'green', className: 'text-green-700' },
    { variant: 'color', color: 'teal', className: 'text-teal-700' },
    { variant: 'color', color: 'cyan', className: 'text-cyan-700' },
    { variant: 'color', color: 'light-blue', className: 'text-light-blue-700' },
    { variant: 'color', color: 'blue', className: 'text-blue-700' },
    { variant: 'color', color: 'purple', className: 'text-purple-700' },
    { variant: 'color', color: 'light-purple', className: 'text-light-purple-700' },
    { variant: 'color', color: 'violet', className: 'text-violet-700' },
    { variant: 'color', color: 'magenta', className: 'text-magenta-700' },
    { variant: 'color', color: 'pink', className: 'text-pink-700' },
  ],
  defaultVariants: {
    variant: 'default',
    color: 'grey',
    size: 'default',
  },
});

const badgeIconVariants = cva('', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      color: '',
    },
    color: {
      grey: '',
      red: '',
      orange: '',
      yellow: '',
      'light-green': '',
      green: '',
      teal: '',
      cyan: '',
      'light-blue': '',
      blue: '',
      purple: '',
      'light-purple': '',
      violet: '',
      magenta: '',
      pink: '',
    },
  },
  compoundVariants: [
    { variant: 'color', color: 'grey', className: 'text-grey-700' },
    { variant: 'color', color: 'red', className: 'text-red-700' },
    { variant: 'color', color: 'orange', className: 'text-orange-700' },
    { variant: 'color', color: 'yellow', className: 'text-yellow-700' },
    { variant: 'color', color: 'light-green', className: 'text-light-green-700' },
    { variant: 'color', color: 'green', className: 'text-green-700' },
    { variant: 'color', color: 'teal', className: 'text-teal-700' },
    { variant: 'color', color: 'cyan', className: 'text-cyan-700' },
    { variant: 'color', color: 'light-blue', className: 'text-light-blue-700' },
    { variant: 'color', color: 'blue', className: 'text-blue-700' },
    { variant: 'color', color: 'purple', className: 'text-purple-700' },
    { variant: 'color', color: 'light-purple', className: 'text-light-purple-700' },
    { variant: 'color', color: 'violet', className: 'text-violet-700' },
    { variant: 'color', color: 'magenta', className: 'text-magenta-700' },
    { variant: 'color', color: 'pink', className: 'text-pink-700' },
  ],
  defaultVariants: {
    variant: 'default',
    color: 'grey',
  },
});

// Icon sizes corresponding to badge sizes
const ICON_SIZES = {
  sm: 10,
  default: 12,
  lg: 14,
} as const;

// Dismiss icon sizes (slightly smaller than regular icons)
const DISMISS_ICON_SIZES = {
  sm: 8,
  default: 10,
  lg: 12,
} as const;

type BadgeProps = React.ComponentProps<typeof View> &
  VariantProps<typeof badgeVariants> & {
    /** Palette key used when variant="color" */
    color?: VariantProps<typeof badgeVariants>['color'];
    /** Callback when dismiss button is pressed. When provided, shows X button and forces secondary styling */
    onDismiss?: () => void;
  } & (
    | { asChild?: false; icon?: LucideIcon; onDismiss?: () => void }
    | { asChild: true; icon?: never; onDismiss?: never }
  );

const Badge = React.forwardRef<View, BadgeProps>(
  (
    { className, variant, color, size = 'default', asChild, icon, onDismiss, children, ...props },
    ref
  ) => {
    const Component = asChild ? Slot.View : View;
    const iconSize = ICON_SIZES[size ?? 'default'];
    const dismissIconSize = DISMISS_ICON_SIZES[size ?? 'default'];

    // When dismissible, force secondary variant
    const effectiveVariant = onDismiss ? 'secondary' : variant;

    const showIcon = !asChild && icon;
    const showDismiss = !asChild && onDismiss;

    return (
      <TextClassContext.Provider value={badgeTextVariants({ variant: effectiveVariant, color, size })}>
        <Component
          ref={ref}
          className={cn(badgeVariants({ variant: effectiveVariant, color, size }), className)}
          {...props}
        >
          {showIcon && (
            <Icon
              as={icon}
              size={iconSize}
              data-badge-icon
              className={badgeIconVariants({ variant: effectiveVariant, color })}
            />
          )}
          {children}
          {showDismiss && (
            <Pressable
              onPress={onDismiss}
              hitSlop={4}
              className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            >
              <X size={dismissIconSize} className="text-secondary-foreground" />
            </Pressable>
          )}
        </Component>
      </TextClassContext.Provider>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeTextVariants, badgeVariants, badgeIconVariants };
export type { BadgeProps };
