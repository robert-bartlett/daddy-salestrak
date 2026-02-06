import { useState, useCallback, useEffect } from 'react';
import { View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { STATUS_OPTIONS, type BadgeColor } from '@/lib/age-utils';
import type { ProjectStatus } from '@/lib/mock-data';

export default function AgeStatusSelectSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { getAgeStatusSelectData, clearAgeStatusSelectData } = useSheetContext();

  const data = getAgeStatusSelectData();
  const [selected, setSelected] = useState<ProjectStatus[]>(data?.selected ?? []);

  // Sync changes back to parent
  useEffect(() => {
    if (data?.onSelectedChange) {
      data.onSelectedChange(selected);
    }
  }, [selected, data]);

  const toggleStatus = useCallback((status: ProjectStatus) => {
    setSelected((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
  }, []);

  // Only show the first 3 statuses (on_track, at_risk, off_track) - not "disabled"
  const statusOptions = STATUS_OPTIONS.slice(0, 3);

  if (!data) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)', padding: 20 }}
      >
        <Text style={{ color: colors.subtitle }}>No selection data available</Text>
      </BlurView>
    );
  }

  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.separator,
        }}
      >
        <Text size="lg" weight="semibold" style={{ color: colors.title }}>
          Age Status
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 8 }}
      >
        {statusOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Pressable key={option.value} onPress={() => toggleStatus(option.value)}>
              {({ pressed }) => (
                <View
                  style={{
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: isSelected ? colors.rowBackground : colors.rowBackground,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    padding: 16,
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? '#0A84FF' : 'transparent',
                  }}
                >
                  <HStack justify="between" align="center">
                    <Badge variant="color" color={option.badgeColor as BadgeColor} size="lg">
                      <Text>{option.label}</Text>
                    </Badge>
                    {isSelected ? <Icon as={Check} size={20} color="#0A84FF" /> : null}
                  </HStack>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </BlurView>
  );
}
