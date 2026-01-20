import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as TooltipPrimitive from '@rn-primitives/tooltip';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Animation timing for tooltip entrance
const ANIMATION_DURATION_MS = 150;

// Default spacing between trigger and tooltip
const DEFAULT_SIDE_OFFSET = 4;

const Tooltip = TooltipPrimitive.Root;
Tooltip.displayName = 'Tooltip';

const TooltipTrigger = TooltipPrimitive.Trigger;
TooltipTrigger.displayName = 'TooltipTrigger';

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

type TooltipContentProps = TooltipPrimitive.ContentProps & {
  portalHost?: string;
};

const TooltipContent = React.forwardRef<TooltipPrimitive.ContentRef, TooltipContentProps>(
  ({ className, sideOffset = DEFAULT_SIDE_OFFSET, portalHost, side = 'top', ...props }, ref) => {
    return (
      <TooltipPrimitive.Portal hostName={portalHost}>
        <FullWindowOverlay>
          <TooltipPrimitive.Overlay style={Platform.select({ native: StyleSheet.absoluteFill })}>
            <NativeOnlyAnimatedView
              entering={FadeIn.duration(ANIMATION_DURATION_MS)}
              exiting={FadeOut}>
              <TextClassContext.Provider value="text-xs text-primary-foreground">
                <TooltipPrimitive.Content
                  ref={ref}
                  sideOffset={sideOffset}
                  className={cn(
                    'bg-primary z-50 rounded-md px-3 py-2 sm:py-1.5',
                    Platform.select({
                      web: 'animate-in fade-in-0 zoom-in-95 origin-(--radix-tooltip-content-transform-origin) w-fit text-balance',
                    }),
                    className
                  )}
                  side={side}
                  {...props}
                />
              </TextClassContext.Provider>
            </NativeOnlyAnimatedView>
          </TooltipPrimitive.Overlay>
        </FullWindowOverlay>
      </TooltipPrimitive.Portal>
    );
  }
);

TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipContent, TooltipTrigger };
export type { TooltipContentProps };
