import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

import { Separator, type SeparatorProps } from '@/components/ui/separator';
import { Text, TextClassContext } from '@/components/ui/text';

/**
 * Context to share orientation with child components.
 * Used by ButtonGroupSeparator to automatically orient correctly.
 */
const ButtonGroupContext = React.createContext<{
  orientation: 'horizontal' | 'vertical';
}>({ orientation: 'horizontal' });

const buttonGroupVariants = cva('flex w-fit items-stretch', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

/**
 * Position-based style overrides for grouped children.
 * Removes borders and border-radius where buttons connect.
 */
const POSITION_STYLES = {
  horizontal: {
    first: 'rounded-r-none',
    middle: 'rounded-none border-l-0',
    last: 'rounded-l-none border-l-0',
    only: '', // Single child keeps all styles
  },
  vertical: {
    first: 'rounded-b-none',
    middle: 'rounded-none border-t-0',
    last: 'rounded-t-none border-t-0',
    only: '',
  },
} as const;

type ButtonGroupProps = ViewProps &
  VariantProps<typeof buttonGroupVariants> & {
    /**
     * Gap between items. Defaults to 0 for seamless grouping.
     * Use non-zero values when items should have visual separation.
     */
    gap?: number;
  };

/**
 * Groups buttons together with seamless borders and connected appearance.
 *
 * Children are automatically styled based on their position:
 * - First child: rounded on the leading edge only
 * - Middle children: no border-radius, no leading border
 * - Last child: rounded on the trailing edge only
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="outline">Left</Button>
 *   <Button variant="outline">Middle</Button>
 *   <Button variant="outline">Right</Button>
 * </ButtonGroup>
 * ```
 */
function ButtonGroup({
  className,
  orientation = 'horizontal',
  gap = 0,
  children,
  ...props
}: ButtonGroupProps) {
  // Ensure orientation is always defined for context and styling
  const resolvedOrientation = orientation ?? 'horizontal';

  // Filter out null/undefined/boolean children for accurate positioning
  const validChildren = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<{ className?: string }> =>
      React.isValidElement(child)
  );

  const childCount = validChildren.length;

  // Clone each child with position-based styling
  const styledChildren = validChildren.map((child, index) => {
    // Determine position
    let position: 'first' | 'middle' | 'last' | 'only';
    if (childCount === 1) {
      position = 'only';
    } else if (index === 0) {
      position = 'first';
    } else if (index === childCount - 1) {
      position = 'last';
    } else {
      position = 'middle';
    }

    const positionStyles = POSITION_STYLES[resolvedOrientation][position];

    // Skip styling for separators - they handle their own appearance
    if (child.type === ButtonGroupSeparator) {
      return child;
    }

    // Merge position styles with existing className
    const existingClassName = child.props.className ?? '';
    return React.cloneElement(child, {
      className: cn(existingClassName, positionStyles),
    });
  });

  return (
    <ButtonGroupContext.Provider value={{ orientation: resolvedOrientation }}>
      <View
        role="group"
        accessibilityRole="none"
        className={cn(buttonGroupVariants({ orientation }), className)}
        style={gap > 0 ? { gap } : undefined}
        {...props}
      >
        {styledChildren}
      </View>
    </ButtonGroupContext.Provider>
  );
}

ButtonGroup.displayName = 'ButtonGroup';

const buttonGroupTextVariants = cva(
  'flex-row items-center gap-2 rounded-md border border-border bg-muted px-4',
  {
    variants: {
      size: {
        default: 'h-10 sm:h-9',
        sm: 'h-9 px-3 sm:h-8',
        lg: 'h-11 px-6 sm:h-10',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type ButtonGroupTextProps = ViewProps &
  VariantProps<typeof buttonGroupTextVariants>;

/**
 * A text/label element styled to match buttons in a group.
 * Useful for displaying static text alongside buttons.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <ButtonGroupText>$</ButtonGroupText>
 *   <Input placeholder="Amount" />
 * </ButtonGroup>
 * ```
 */
const ButtonGroupText = React.forwardRef<View, ButtonGroupTextProps>(
  ({ className, size, children, ...props }, ref) => {
    const textClass = 'text-sm font-medium text-foreground';

    return (
      <TextClassContext.Provider value={textClass}>
        <View
          ref={ref}
          className={cn(buttonGroupTextVariants({ size }), className)}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (typeof child === 'string' || typeof child === 'number') {
              return <Text>{child}</Text>;
            }
            return child;
          })}
        </View>
      </TextClassContext.Provider>
    );
  }
);

ButtonGroupText.displayName = 'ButtonGroupText';

type ButtonGroupSeparatorProps = Omit<SeparatorProps, 'orientation'>;

/**
 * A visual separator for use within a ButtonGroup.
 * Automatically orients based on the parent ButtonGroup's orientation.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="outline">Save</Button>
 *   <ButtonGroupSeparator />
 *   <Button variant="outline" size="icon"><ChevronDown /></Button>
 * </ButtonGroup>
 * ```
 */
const ButtonGroupSeparator = React.forwardRef<
  React.ComponentRef<typeof Separator>,
  ButtonGroupSeparatorProps
>(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(ButtonGroupContext);

  // Separator orientation is perpendicular to group orientation
  const separatorOrientation =
    orientation === 'horizontal' ? 'vertical' : 'horizontal';

  return (
    <Separator
      ref={ref}
      data-slot="button-group-separator"
      orientation={separatorOrientation}
      className={cn(
        'self-stretch',
        // Ensure it fills the cross-axis
        orientation === 'horizontal' ? 'h-auto' : 'w-auto',
        className
      )}
      {...props}
    />
  );
});

ButtonGroupSeparator.displayName = 'ButtonGroupSeparator';

/**
 * Hook to access ButtonGroup context.
 * Useful for building custom components that need to know group orientation.
 */
function useButtonGroup() {
  const context = React.useContext(ButtonGroupContext);
  return context;
}

export {
  ButtonGroup,
  ButtonGroupContext,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupTextVariants,
  buttonGroupVariants,
  useButtonGroup,
};

export type { ButtonGroupProps, ButtonGroupSeparatorProps, ButtonGroupTextProps };
