import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, View } from 'react-native';

import { EmptyProvider, type EmptySize } from './empty-context';

const emptyRootVariants = cva(
  cn('flex-col items-center justify-center', Platform.select({ web: 'transition-colors' })),
  {
    variants: {
      size: {
        sm: 'gap-3 p-4',
        md: 'gap-4 p-6',
        lg: 'gap-6 p-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type EmptyRootProps = React.ComponentProps<typeof View> &
  VariantProps<typeof emptyRootVariants> & {
    size?: EmptySize;
  };

const EmptyRoot = React.forwardRef<View, EmptyRootProps>(
  ({ size = 'md', className, children, ...props }, ref) => {
    const contextValue = React.useMemo(() => ({ size }), [size]);

    return (
      <EmptyProvider value={contextValue}>
        <View
          ref={ref}
          className={cn(emptyRootVariants({ size }), className)}
          {...props}
        >
          {children}
        </View>
      </EmptyProvider>
    );
  }
);

EmptyRoot.displayName = 'EmptyRoot';

export { EmptyRoot, emptyRootVariants };
export type { EmptyRootProps };
