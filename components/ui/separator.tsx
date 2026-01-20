import * as React from 'react';

import { cn } from '@/lib/utils';
import * as SeparatorPrimitive from '@rn-primitives/separator';

// Separator styles by orientation (1px thickness)
const SEPARATOR_STYLES = {
  horizontal: 'h-[1px] w-full',
  vertical: 'h-full w-[1px]',
} as const;

type SeparatorProps = SeparatorPrimitive.RootProps;

/**
 * A visual divider for separating content sections.
 *
 * @ref Forwards ref to the underlying separator primitive.
 */
const Separator = React.forwardRef<SeparatorPrimitive.RootRef, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'bg-border shrink-0',
          SEPARATOR_STYLES[orientation],
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { Separator };
export type { SeparatorProps };
