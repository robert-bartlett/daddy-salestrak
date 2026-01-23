import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { View } from 'react-native';

import { useEmptySize } from './empty-context';

const emptyHeaderVariants = cva('flex-col items-center', {
  variants: {
    size: {
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
    },
  },
});

type EmptyHeaderProps = React.ComponentProps<typeof View>;

const EmptyHeader = React.forwardRef<View, EmptyHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const size = useEmptySize();

    return (
      <View
        ref={ref}
        className={cn(emptyHeaderVariants({ size }), className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

EmptyHeader.displayName = 'EmptyHeader';

export { EmptyHeader, emptyHeaderVariants };
export type { EmptyHeaderProps };
