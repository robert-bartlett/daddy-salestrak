import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
import { type FillOption, getFillClass } from './layout-constants';

type CenterProps = Omit<ViewProps, 'className' | 'style'> & {
  fill?: FillOption;
};

/**
 * Center - Centers content both horizontally and vertically
 *
 * @example
 * ```tsx
 * <Center fill>
 *   <Text>Centered content</Text>
 * </Center>
 * ```
 */
const Center = React.memo(
  React.forwardRef<View, CenterProps>(({ fill, ...props }, ref) => {
    const debugStyle = useDebugStyle();

    return (
      <View
        ref={ref}
        className={cn(getFillClass(fill), 'items-center justify-center')}
        style={debugStyle}
        {...props}
      />
    );
  })
);
Center.displayName = 'Center';

export { Center };
export type { CenterProps };
