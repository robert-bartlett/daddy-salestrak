import { useEffect, useState, useCallback } from 'react';
import { View, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { STATUS_OPTIONS, getStatusHexColor } from '@/lib/age-utils';
import { getIOSSheetColors } from '@/lib/ios-colors';
import type { ProjectStatus } from '@/lib/mock-data';

/**
 * Native iOS Status Select Sheet (stacks on top of Age Update Sheet)
 */
export default function StatusSelectSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';
  const sheetBackground = isDark ? '#1c1c1e' : '#f2f2f7';

  const { getStatusSelectData, clearStatusSelectData } = useSheetContext();
  const data = getStatusSelectData();

  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(
    data?.currentStatus ?? 'on_track'
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data?.currentStatus) {
      setSelectedStatus(data.currentStatus);
    }
  }, [data?.currentStatus]);

  const handleSelect = useCallback(
    (status: ProjectStatus) => {
      if (data?.onSelect) {
        data.onSelect(status);
      }
      clearStatusSelectData();
      router.back();
    },
    [data, clearStatusSelectData, router]
  );

  if (!isMounted) {
    return <View style={{ flex: 1, backgroundColor: sheetBackground }} />;
  }

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: sheetBackground, padding: 20 }}>
        <Text style={{ color: colors.subtitle }}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: sheetBackground }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.separator,
        }}
      >
        <Text size="lg" weight="semibold" style={{ color: colors.title }}>
          Select Status
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom }}
      >
        <VStack gap="xs">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selectedStatus === option.value;
            const statusColor = getStatusHexColor(option.value);

            return (
              <Button
                key={option.value}
                variant={isSelected ? 'secondary' : 'ghost'}
                onPress={() => handleSelect(option.value)}
              >
                <View style={{ flex: 1 }}>
                  <HStack justify="between" align="center">
                    <HStack gap="sm" align="center">
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: statusColor,
                        }}
                      />
                      <Text weight={isSelected ? 'semibold' : 'regular'}>
                        {option.label}
                      </Text>
                    </HStack>
                    {isSelected ? <Icon as={Check} size={18} /> : null}
                  </HStack>
                </View>
              </Button>
            );
          })}
        </VStack>
      </ScrollView>
    </View>
  );
}
