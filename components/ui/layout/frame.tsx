import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useDebugStyle } from './layout-debug-context';
import { type FillOption, getFillClass } from './layout-constants';

type FrameProps = Omit<ViewProps, 'className' | 'style'> & {
  fill?: FillOption;
};

/**
 * Frame - A minimal flex-column container for structuring layouts
 *
 * Use as a structural wrapper when you need basic flex behavior
 * without the additional styling options of Box.
 *
 * @example
 * ```tsx
 * <Frame fill>
 *   <Header />
 *   <Content />
 *   <Footer />
 * </Frame>
 * ```
 */
const Frame = React.memo(
  React.forwardRef<View, FrameProps>(({ fill, ...props }, ref) => {
    const debugStyle = useDebugStyle();

    return (
      <View
        ref={ref}
        className={cn('flex-col', getFillClass(fill))}
        style={debugStyle}
        {...props}
      />
    );
  })
);
Frame.displayName = 'Frame';

export { Frame };
export type { FrameProps };
