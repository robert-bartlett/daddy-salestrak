import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { Text as RNText } from 'react-native';

import { Text } from '@/components/ui/text';

import { useEmptySize } from './empty-context';

const emptyDescriptionVariants = cva('text-muted-foreground text-center', {
  variants: {
    size: {
      sm: 'text-sm max-w-[280px]',
      md: 'text-base max-w-[320px]',
      lg: 'text-lg max-w-[400px]',
    },
  },
});

type EmptyDescriptionProps = React.ComponentProps<typeof Text>;

const EmptyDescription = React.forwardRef<RNText, EmptyDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    const size = useEmptySize();

    return (
      <Text
        ref={ref}
        className={cn(emptyDescriptionVariants({ size }), className)}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

EmptyDescription.displayName = 'EmptyDescription';

export { EmptyDescription, emptyDescriptionVariants };
export type { EmptyDescriptionProps };
