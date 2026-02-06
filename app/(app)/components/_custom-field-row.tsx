import { useState, useRef, useEffect } from 'react';
import { View, Pressable, TextInput, Keyboard, Modal, ScrollView, useColorScheme } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { DatePicker } from '@/components/ui/date-picker';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { type CustomFieldDefinition } from '@/lib/mock-data';

type CustomFieldRowProps = {
  field: CustomFieldDefinition;
  value: string | number | Date | null | undefined;
  onChange: (value: string | number | Date | null) => void;
  colors: {
    text: string;
    textMuted: string;
    textSecondary: string;
    cardBg: string;
    border: string;
    accent: string;
  };
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function CustomFieldRow({ field, value, onChange, colors }: CustomFieldRowProps) {
  const colorScheme = useColorScheme();
  const sheetColors = getIOSSheetColors(colorScheme);
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Sync local value when value prop changes
  useEffect(() => {
    if (field.type === 'currency') {
      setLocalValue(typeof value === 'number' ? String(value) : '');
    } else if (field.type === 'date') {
      // Date is handled by DatePicker component
    } else {
      setLocalValue(typeof value === 'string' ? value : '');
    }
  }, [value, field.type]);

  const handleStartEditing = () => {
    if (field.type === 'dropdown') {
      setDropdownOpen(true);
    } else if (field.type === 'date') {
      // Date picker handles its own modal
    } else {
      setIsEditing(true);
      // Focus input after state update
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleEndEditing = () => {
    setIsEditing(false);
    Keyboard.dismiss();

    if (field.type === 'currency') {
      const numValue = parseFloat(localValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(numValue)) {
        onChange(numValue);
      } else if (localValue === '') {
        onChange(null);
      }
    } else {
      onChange(localValue.trim() || null);
    }
  };

  const handleSelectDropdown = (option: string) => {
    onChange(option);
    setDropdownOpen(false);
  };

  const getDisplayValue = (): string => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    switch (field.type) {
      case 'currency':
        return typeof value === 'number' ? currencyFormatter.format(value) : '';
      case 'date':
        return value instanceof Date ? dateFormatter.format(value) : '';
      default:
        return String(value);
    }
  };

  const getKeyboardType = () => {
    switch (field.type) {
      case 'phone':
        return 'phone-pad' as const;
      case 'email':
        return 'email-address' as const;
      case 'currency':
        return 'decimal-pad' as const;
      default:
        return 'default' as const;
    }
  };

  const displayValue = getDisplayValue();
  const isEmpty = !displayValue;

  const ROW_HEIGHT = 40;

  // Date field - use DatePicker
  if (field.type === 'date') {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: ROW_HEIGHT,
          gap: 12,
        }}
      >
        <Text size="sm" style={{ flex: 1, minWidth: 100, color: colors.text }} numberOfLines={1}>
          {field.label}
          {field.required ? (
            <Text size="sm" style={{ color: colors.accent }}> *</Text>
          ) : null}
        </Text>
        <View style={{ flex: 1.5 }}>
          <DatePicker
            value={value instanceof Date ? value : null}
            onChange={(date) => onChange(date)}
            placeholder={field.label}
          />
        </View>
      </View>
    );
  }

  // Dropdown field
  if (field.type === 'dropdown') {
    return (
      <>
        <Pressable
          onPress={handleStartEditing}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: ROW_HEIGHT,
            gap: 12,
          }}
        >
          <Text size="sm" style={{ flex: 1, minWidth: 100, color: colors.text }} numberOfLines={1}>
            {field.label}
            {field.required ? (
              <Text size="sm" style={{ color: colors.accent }}> *</Text>
            ) : null}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              size="sm"
              style={{ color: isEmpty ? colors.textMuted : colors.textSecondary }}
              numberOfLines={1}
            >
              {displayValue || field.label}
            </Text>
            <Icon as={ChevronRight} size={16} color={colors.textMuted} />
          </View>
        </Pressable>

        {/* Dropdown Modal - native formSheet */}
        <Modal
          visible={dropdownOpen}
          presentationStyle="formSheet"
          animationType="slide"
          onRequestClose={() => setDropdownOpen(false)}
        >
          <View style={{ flex: 1, backgroundColor: sheetColors.background }}>
            {/* Header with grabber */}
            <View
              style={{
                paddingBottom: 12,
                borderBottomWidth: 0.5,
                borderBottomColor: sheetColors.separator,
              }}
            >
              <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 8 }}>
                <View
                  style={{
                    width: 36,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: sheetColors.grabber,
                  }}
                />
              </View>
              <View style={{ paddingHorizontal: 20 }}>
                <Text size="lg" weight="semibold" style={{ color: sheetColors.title }}>
                  {field.label}
                </Text>
              </View>
            </View>

            {/* Scrollable options */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {field.options?.map((option) => {
                const isSelected = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => handleSelectDropdown(option)}
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          opacity: pressed ? 0.7 : 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: 20,
                          paddingVertical: 14,
                          borderBottomWidth: 0.5,
                          borderBottomColor: sheetColors.separator,
                        }}
                      >
                        <Text
                          size="base"
                          weight={isSelected ? 'semibold' : 'regular'}
                          style={{ color: sheetColors.title }}
                        >
                          {option}
                        </Text>
                        {isSelected ? (
                          <Icon as={Check} size={20} color="#0A84FF" />
                        ) : null}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      </>
    );
  }

  // Text, phone, email, currency fields
  return (
    <Pressable
      onPress={handleStartEditing}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: ROW_HEIGHT,
        gap: 12,
      }}
    >
      <Text size="sm" style={{ flex: 1, minWidth: 100, color: colors.text }} numberOfLines={1}>
        {field.label}
        {field.required ? (
          <Text size="sm" style={{ color: colors.accent }}> *</Text>
        ) : null}
      </Text>
      {isEditing ? (
        <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {field.type === 'currency' ? (
            <Text size="sm" style={{ color: colors.textSecondary }}>$</Text>
          ) : null}
          <Input
            ref={inputRef}
            value={localValue}
            onChangeText={setLocalValue}
            onBlur={handleEndEditing}
            onSubmitEditing={handleEndEditing}
            keyboardType={getKeyboardType()}
            autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
            returnKeyType="done"
            placeholder={field.type === 'currency' ? '0' : `Enter ${field.label.toLowerCase()}`}
          />
        </View>
      ) : (
        <Text
          size="sm"
          style={{ color: isEmpty ? colors.textMuted : colors.textSecondary, textAlign: 'right' }}
          numberOfLines={1}
        >
          {displayValue || field.label}
        </Text>
      )}
    </Pressable>
  );
}
