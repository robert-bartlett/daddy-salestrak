import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { Text as RNText } from 'react-native';

import { Text } from '@/components/ui/text';

import { useEmptySize } from './empty-context';

const emptyTitleVariants = cva('font-semibold text-foreground text-center', {
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    },
  },
});

type EmptyTitleProps = React.ComponentProps<typeof Text>;

const EmptyTitle = React.forwardRef<RNText, EmptyTitleProps>(
  ({ className, children, ...props }, ref) => {
    const size = useEmptySize();

    return (
      <Text
        ref={ref}
        className={cn(emptyTitleVariants({ size }), className)}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

EmptyTitle.displayName = 'EmptyTitle';

export { EmptyTitle, emptyTitleVariants };
export type { EmptyTitleProps };
