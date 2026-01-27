import { cn } from '@/lib/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

const textVariants = cva(
  cn(
    'text-base text-foreground',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        default: '',
        h1: cn(
          'text-center text-4xl font-extrabold tracking-tight',
          Platform.select({ web: 'scroll-m-20 text-balance' })
        ),
        h2: cn(
          'border-b border-border pb-2 text-3xl font-semibold tracking-tight',
          Platform.select({ web: 'scroll-m-20 first:mt-0' })
        ),
        h3: cn('text-2xl font-semibold tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        h4: cn('text-xl font-semibold tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        p: 'mt-3 leading-7 sm:mt-6',
        blockquote: 'mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
        code: cn(
          'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'
        ),
        lead: 'text-xl text-muted-foreground',
        large: 'text-lg font-semibold',
        small: 'text-sm font-medium leading-none',
        muted: 'text-sm text-muted-foreground',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
      },
      weight: {
        regular: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      tone: {
        default: '',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-success-foreground',
        warning: 'text-warning-foreground',
        info: 'text-info-foreground',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

// Maps semantic text variants to accessibility roles
const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
};

// Maps heading variants to their semantic level for screen readers
const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

type TextProps = React.ComponentProps<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean;
  };

const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      className,
      asChild = false,
      variant = 'default',
      size,
      weight,
      tone,
      align,
      ...props
    },
    ref
  ) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;
    return (
      <Component
        ref={ref}
        className={cn(
          textVariants({ variant, size, weight, tone, align }),
          textClass,
          className
        )}
        role={variant ? ROLE[variant] : undefined}
        aria-level={variant ? ARIA_LEVEL[variant] : undefined}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

const WHITESPACE_WITH_LINE_BREAKS = /[\n\r\t]/;

function wrapTextChildren(children: React.ReactNode) {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      // Drop newline/tab-only formatting artifacts but preserve explicit spaces.
      if (child.trim() === '' && WHITESPACE_WITH_LINE_BREAKS.test(child)) {
        return null;
      }
      return <Text>{child}</Text>;
    }
    if (typeof child === 'number') {
      return <Text>{child}</Text>;
    }
    return child;
  });
}

export { Text, TextClassContext, textVariants, wrapTextChildren };
export type { TextProps };
