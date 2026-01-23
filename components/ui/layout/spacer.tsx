import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { SPACING_SCALE, type SpacingToken } from './layout-constants';

type SpacerDirection = 'horizontal' | 'vertical';

type SpacerProps = Omit<ViewProps, 'className' | 'style'> & {
  size?: SpacingToken;
  direction?: SpacerDirection;
};

const Spacer = React.forwardRef<View, SpacerProps>(
  ({ size, direction = 'vertical', ...props }, ref) => {
    if (!size) {
      return <View ref={ref} className="flex-1" {...props} />;
    }

    const length = SPACING_SCALE[size];
    const style =
      direction === 'horizontal'
        ? { width: length, flexShrink: 0 }
        : { height: length, flexShrink: 0 };

    return <View ref={ref} style={style} {...props} />;
  }
);

Spacer.displayName = 'Spacer';

export { Spacer };
export type { SpacerProps, SpacerDirection };
