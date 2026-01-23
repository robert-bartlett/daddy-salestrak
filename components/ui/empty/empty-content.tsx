import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { View } from 'react-native';

import { useEmptySize } from './empty-context';

const emptyContentVariants = cva(
  'flex-row flex-wrap items-center justify-center',
  {
    variants: {
      size: {
        sm: 'gap-2 mt-2',
        md: 'gap-3 mt-3',
        lg: 'gap-4 mt-4',
      },
    },
  }
);

type EmptyContentProps = React.ComponentProps<typeof View>;

const EmptyContent = React.forwardRef<View, EmptyContentProps>(
  ({ className, children, ...props }, ref) => {
    const size = useEmptySize();

    return (
      <View
        ref={ref}
        className={cn(emptyContentVariants({ size }), className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

EmptyContent.displayName = 'EmptyContent';

export { EmptyContent, emptyContentVariants };
export type { EmptyContentProps };
