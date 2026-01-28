import * as React from 'react';
import type { ViewStyle } from 'react-native';

type LayoutDebugContextValue = {
  enabled: boolean;
  borderColor?: string;
};

const LayoutDebugContext = React.createContext<LayoutDebugContextValue>({
  enabled: false,
});

type LayoutDebugProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
  borderColor?: string;
};

/**
 * Enables visual debugging for layout components.
 * All layout components within this provider render with visible borders.
 *
 * @example
 * <LayoutDebugProvider enabled>
 *   <Box padding="md">...</Box>
 * </LayoutDebugProvider>
 */
const LayoutDebugProvider = ({
  children,
  enabled = true,
  borderColor,
}: LayoutDebugProviderProps) => {
  const value = React.useMemo(
    () => ({ enabled, borderColor }),
    [enabled, borderColor]
  );

  return (
    <LayoutDebugContext.Provider value={value}>
      {children}
    </LayoutDebugContext.Provider>
  );
};
LayoutDebugProvider.displayName = 'LayoutDebugProvider';

const useLayoutDebug = () => React.useContext(LayoutDebugContext);

/**
 * Returns debug border styles when debug mode is enabled.
 * Use this hook to add debug visualization to layout components.
 */
function useDebugStyle(): ViewStyle | undefined {
  const { enabled, borderColor } = useLayoutDebug();
  return React.useMemo(() => {
    if (!enabled) return undefined;
    return { borderWidth: 1, borderColor: borderColor ?? 'rgba(255,0,0,0.3)' };
  }, [enabled, borderColor]);
}

export { LayoutDebugProvider, useDebugStyle };
export type { LayoutDebugProviderProps };
