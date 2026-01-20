import * as React from 'react';
import { Platform, View } from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Base styles shared across all platforms
const BASE_STYLES =
  'border-border group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5';

// Web-specific styles for focus, transitions, and SVG handling
const WEB_STYLES =
  'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3';

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
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const badgeTextVariants = cva('text-xs font-medium', {
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

type BadgeProps = React.ComponentProps<typeof View> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

const Badge = React.forwardRef<View, BadgeProps>(
  ({ className, variant, asChild, ...props }, ref) => {
    const Component = asChild ? Slot.View : View;
    return (
      <TextClassContext.Provider value={badgeTextVariants({ variant })}>
        <Component
          ref={ref}
          className={cn(badgeVariants({ variant }), className)}
          {...props}
        />
      </TextClassContext.Provider>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeTextVariants, badgeVariants };
export type { BadgeProps };
