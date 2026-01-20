import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as PopoverPrimitive from '@rn-primitives/popover';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

// Animation timing for popover fade in/out
const FADE_DURATION_MS = 200;

// Default offset from trigger element
const DEFAULT_SIDE_OFFSET = 4;

const Popover = PopoverPrimitive.Root;
Popover.displayName = 'Popover';

const PopoverTrigger = PopoverPrimitive.Trigger;
PopoverTrigger.displayName = 'PopoverTrigger';

// Use FullWindowOverlay on iOS to render above native modals
const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

type PopoverContentProps = PopoverPrimitive.ContentProps & {
  portalHost?: string;
};

const PopoverContent = React.forwardRef<PopoverPrimitive.ContentRef, PopoverContentProps>(
  ({ className, align = 'center', side = 'bottom', sideOffset = DEFAULT_SIDE_OFFSET, portalHost, ...props }, ref) => {
    return (
      <PopoverPrimitive.Portal hostName={portalHost}>
        <FullWindowOverlay>
          <PopoverPrimitive.Overlay style={Platform.select({ native: StyleSheet.absoluteFill })}>
            <NativeOnlyAnimatedView entering={FadeIn.duration(FADE_DURATION_MS)} exiting={FadeOut.duration(FADE_DURATION_MS)}>
              <TextClassContext.Provider value="text-popover-foreground">
                <PopoverPrimitive.Content
                  ref={ref}
                  align={align}
                  sideOffset={sideOffset}
                  className={cn(
                    'bg-popover border-border outline-hidden z-50 w-72 rounded-md border p-4 shadow-md shadow-black/5',
                    Platform.select({
                      web: cn(
                        'animate-in fade-in-0 zoom-in-95 origin-(--radix-popover-content-transform-origin) cursor-auto',
                        side === 'bottom' && 'slide-in-from-top-2',
                        side === 'top' && 'slide-in-from-bottom-2'
                      ),
                    }),
                    className
                  )}
                  {...props}
                />
              </TextClassContext.Provider>
            </NativeOnlyAnimatedView>
          </PopoverPrimitive.Overlay>
        </FullWindowOverlay>
      </PopoverPrimitive.Portal>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverContent, PopoverTrigger };
export type { PopoverContentProps };
