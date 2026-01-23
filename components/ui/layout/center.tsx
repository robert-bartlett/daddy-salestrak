import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

type CenterProps = Omit<ViewProps, 'className' | 'style'> & {
  fill?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
};

const Center = React.forwardRef<View, CenterProps>(
  ({ fill, horizontal, vertical, ...props }, ref) => {
    const shouldCenterHorizontal = horizontal !== undefined ? horizontal : vertical === undefined;
    const shouldCenterVertical = vertical !== undefined ? vertical : horizontal === undefined;

    return (
      <View
        ref={ref}
        className={cn(
          fill ? 'flex-1 self-stretch' : undefined,
          shouldCenterHorizontal ? 'items-center' : undefined,
          shouldCenterVertical ? 'justify-center' : undefined
        )}
        {...props}
      />
    );
  }
);

Center.displayName = 'Center';

export { Center };
export type { CenterProps };
