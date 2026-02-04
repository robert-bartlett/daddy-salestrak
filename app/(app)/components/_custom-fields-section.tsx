import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { VStack, HStack } from '@/components/ui/layout';
import { CustomFieldRow } from './_custom-field-row';
import {
  PROJECT_CUSTOM_FIELDS,
  type ProjectCustomFields,
} from '@/lib/mock-data';

type CustomFieldsSectionProps = {
  customFields: ProjectCustomFields;
  onFieldChange: (key: string, value: string | number | Date | null) => void;
  colors: {
    text: string;
    textMuted: string;
    textSecondary: string;
    cardBg: string;
    border: string;
    accent: string;
  };
};

export function CustomFieldsSection({
  customFields,
  onFieldChange,
  colors,
}: CustomFieldsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // Filter fields to show
  // Default: show required fields + fields with values
  // Show all: display all 26 fields
  const visibleFields = showAll
    ? PROJECT_CUSTOM_FIELDS
    : PROJECT_CUSTOM_FIELDS.filter((field) => {
        if (field.required) return true;
        const value = customFields[field.key];
        return value !== null && value !== undefined && value !== '';
      });

  const hiddenCount = PROJECT_CUSTOM_FIELDS.length - visibleFields.length;

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <VStack gap="sm">
        {/* Header */}
        <Text size="sm" weight="medium" style={{ color: colors.text }}>
          Custom Fields
        </Text>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 4,
          }}
        />

        {/* Field Rows */}
        {visibleFields.length > 0 ? (
          visibleFields.map((field, index) => (
            <View key={field.key}>
              <CustomFieldRow
                field={field}
                value={customFields[field.key]}
                onChange={(value) => onFieldChange(field.key, value)}
                colors={colors}
              />
              {index < visibleFields.length - 1 ? (
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    marginLeft: 0,
                  }}
                />
              ) : null}
            </View>
          ))
        ) : (
          <View style={{ paddingVertical: 12 }}>
            <Text size="sm" style={{ color: colors.textMuted, textAlign: 'center' }}>
              No custom fields to display
            </Text>
          </View>
        )}

        {/* Separator before show all */}
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
          }}
        />

        {/* Show all toggle - at bottom */}
        <Pressable
          onPress={() => setShowAll(!showAll)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            height: 40,
          }}
        >
          <Text size="sm" style={{ color: colors.accent }}>
            {showAll ? 'Show required' : `Show all (${hiddenCount} more)`}
          </Text>
          <Icon
            as={showAll ? ChevronUp : ChevronDown}
            size={14}
            color={colors.accent}
          />
        </Pressable>
      </VStack>
    </View>
  );
}
