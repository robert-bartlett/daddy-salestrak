import * as React from 'react';
import { Platform, Pressable, View, Modal } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';

import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

type DatePickerProps = {
  /** Currently selected date */
  value?: Date | null;
  /** Callback when date changes */
  onChange: (date: Date | null) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Minimum selectable date */
  minimumDate?: Date;
  /** Maximum selectable date */
  maximumDate?: Date;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = React.useState(false);
  // Temp date for iOS modal (confirm/cancel pattern)
  const [tempDate, setTempDate] = React.useState<Date>(value ?? new Date());

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS - update temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value ?? new Date());
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
  };

  const handlePress = () => {
    if (!disabled) {
      setTempDate(value ?? new Date());
      setShowPicker(true);
    }
  };

  const formattedValue = value ? dateFormatter.format(value) : null;

  return (
    <>
      {/* Trigger */}
      <View className="flex flex-row items-center gap-1">
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          className={cn(
            'flex h-8 flex-1 flex-row items-center justify-between gap-2 rounded-md border border-input bg-background px-2 shadow-sm shadow-black/5 dark:bg-input/30',
            disabled && 'opacity-50'
          )}
        >
          {formattedValue ? (
            <Text className="text-sm text-foreground">{formattedValue}</Text>
          ) : (
            <Text className="text-sm text-muted-foreground">{placeholder}</Text>
          )}
          <Icon as={Calendar} className="size-4 text-muted-foreground" />
        </Pressable>

        {/* Clear button - only show when there's a value */}
        {value && !disabled ? (
          <Pressable
            onPress={handleClear}
            className="h-8 w-8 items-center justify-center rounded-md active:bg-accent"
          >
            <Icon as={X} className="size-4 text-muted-foreground" />
          </Pressable>
        ) : null}
      </View>

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && showPicker ? (
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={handleCancel}
        >
          <Pressable
            className="flex-1 justify-end bg-black/50"
            onPress={handleCancel}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-2xl bg-background dark:bg-card"
            >
              {/* Header */}
              <View className="flex flex-row items-center justify-between border-b border-border px-4 py-3">
                <Button variant="ghost" size="sm" onPress={handleCancel}>
                  <Text>Cancel</Text>
                </Button>
                <Text className="font-medium text-foreground">Select Date</Text>
                <Button variant="ghost" size="sm" onPress={handleConfirm}>
                  <Text className="text-primary">Done</Text>
                </Button>
              </View>

              {/* Picker */}
              <View className="pb-8">
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  themeVariant="dark"
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {/* Android Picker (renders as native dialog) */}
      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}
    </>
  );
}
