import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';
import * as React from 'react';
import { Platform, Switch as RNSwitch, type SwitchProps as RNSwitchProps } from 'react-native';

type SwitchProps = SwitchPrimitives.RootProps &
  React.RefAttributes<SwitchPrimitives.RootRef> &
  Omit<RNSwitchProps, 'value' | 'onValueChange'> & {
    value?: boolean;
    onValueChange?: (value: boolean) => void;
  };

const Switch = React.forwardRef<SwitchPrimitives.RootRef | RNSwitch, SwitchProps>(
  ({ className, checked, disabled, onCheckedChange, value, onValueChange, ...props }, ref) => {
    if (Platform.OS !== 'web') {
      const resolvedValue = value ?? checked ?? false;
      const handleValueChange = (nextValue: boolean) => {
        onValueChange?.(nextValue);
        onCheckedChange?.(nextValue);
      };

      return (
        <RNSwitch
          ref={ref as React.Ref<RNSwitch>}
          value={resolvedValue}
          disabled={disabled}
          onValueChange={handleValueChange}
          accessibilityState={{ checked: resolvedValue }}
          {...props}
        />
      );
    }

    const resolvedChecked = checked ?? value;

    return (
      <SwitchPrimitives.Root
        ref={ref as React.Ref<SwitchPrimitives.RootRef>}
        accessibilityRole="switch"
        aria-checked={resolvedChecked}
        className={cn(
          'flex h-[1.15rem] w-8 shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5',
          Platform.select({
            web: 'peer inline-flex outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed',
          }),
          resolvedChecked ? 'bg-primary' : 'bg-input dark:bg-input/80',
          disabled && 'opacity-50',
          className
        )}
        checked={resolvedChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        {...props}>
        <SwitchPrimitives.Thumb
          className={cn(
            'size-4 rounded-full bg-background transition-transform',
            Platform.select({
              web: 'pointer-events-none block ring-0',
            }),
            resolvedChecked
              ? 'translate-x-3.5 dark:bg-primary-foreground'
              : 'translate-x-0 dark:bg-foreground'
          )}
        />
      </SwitchPrimitives.Root>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
export type { SwitchProps };
