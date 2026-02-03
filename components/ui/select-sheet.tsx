import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export type SelectSheetOption = {
  value: string;
  label: string;
  /** Optional badge color for this option (uses Badge variant="color") */
  badgeColor?: BadgeProps['color'];
};

type SelectSheetProps = {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectSheetOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
};

export function SelectSheet({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  label,
  disabled = false,
}: SelectSheetProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full flex-row items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 shadow-sm shadow-black/5 dark:bg-input/30',
          disabled && 'opacity-50'
        )}
      >
        {selectedOption ? (
          selectedOption.badgeColor ? (
            <Badge variant="color" color={selectedOption.badgeColor}>
              <Text>{selectedOption.label}</Text>
            </Badge>
          ) : (
            <Text className="text-sm text-foreground">{selectedOption.label}</Text>
          )
        ) : (
          <Text className="text-sm text-muted-foreground">{placeholder}</Text>
        )}
        <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
      </Pressable>

      {/* Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>{label ?? 'Select an option'}</SheetTitle>
          </SheetHeader>
          <ScrollArea maxHeight={400}>
            <View className="pb-8">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className={cn(
                      'flex flex-row items-center justify-between px-4 py-3 active:bg-accent'
                    )}
                  >
                    {option.badgeColor ? (
                      <Badge variant="color" color={option.badgeColor} size="lg">
                        <Text>{option.label}</Text>
                      </Badge>
                    ) : (
                      <Text
                        className={cn(
                          'text-base text-foreground',
                          isSelected && 'font-medium'
                        )}
                      >
                        {option.label}
                      </Text>
                    )}
                    {isSelected && (
                      <Icon as={Check} className="size-5 text-primary" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
