import * as React from 'react';
import { Platform, View } from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Base styles shared across all platforms
const BASE_STYLES =
  'border-border group shrink-0 flex-row items-center justify-center overflow-hidden border';

// Web-specific styles for focus, transitions, and SVG handling
const WEB_STYLES =
  'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none';

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
      },
      size: {
        sm: 'h-4 gap-0.5 rounded px-1.5',
        default: 'h-5 gap-1 rounded px-2',
        lg: 'h-6 gap-1.5 rounded-md px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
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
    },
    size: {
      sm: 'text-[10px] leading-none',
      default: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
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
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// Icon sizes corresponding to badge sizes
const ICON_SIZES = {
  sm: 10,
  default: 12,
  lg: 14,
} as const;

type BadgeProps = React.ComponentProps<typeof View> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    /** Lucide icon to display on the left side of the badge */
    icon?: LucideIcon;
  };

const Badge = React.forwardRef<View, BadgeProps>(
  ({ className, variant, size = 'default', asChild, icon, children, ...props }, ref) => {
    const Component = asChild ? Slot.View : View;
    const textStyles = badgeTextVariants({ variant, size });
    const iconSize = ICON_SIZES[size ?? 'default'];
    const iconClassName = badgeIconVariants({ variant });

    return (
      <TextClassContext.Provider value={textStyles}>
        <Component
          ref={ref}
          className={cn(badgeVariants({ variant, size }), className)}
          {...props}
        >
          {icon && <Icon as={icon} size={iconSize} className={iconClassName} />}
          {children}
        </Component>
      </TextClassContext.Provider>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeTextVariants, badgeVariants, badgeIconVariants };
export type { BadgeProps };
