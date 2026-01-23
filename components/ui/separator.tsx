import * as React from 'react';

import { cn } from '@/lib/utils';
import * as SeparatorPrimitive from '@rn-primitives/separator';
import { SPACING_SCALE, type SpacingToken } from '@/components/ui/layout/layout-constants';

// Separator styles by orientation (1px thickness)
const SEPARATOR_STYLES = {
  horizontal: 'h-[1px] w-full',
  vertical: 'h-full w-[1px]',
} as const;

type SeparatorProps = SeparatorPrimitive.RootProps & {
  /** Optional length for the separator using semantic spacing tokens. */
  length?: SpacingToken | number;
};

/**
 * A visual divider for separating content sections.
 *
 * @ref Forwards ref to the underlying separator primitive.
 */
const Separator = React.forwardRef<SeparatorPrimitive.RootRef, SeparatorProps>(
  (
    { className, orientation = 'horizontal', decorative = true, length, style, ...props },
    ref
  ) => {
    const lengthValue =
      typeof length === 'number' ? length : length ? SPACING_SCALE[length] : undefined;
    const lengthStyle = lengthValue
      ? orientation === 'horizontal'
        ? { width: lengthValue }
        : { height: lengthValue }
      : undefined;
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
        style={[lengthStyle, style]}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { Separator };
export type { SeparatorProps };
