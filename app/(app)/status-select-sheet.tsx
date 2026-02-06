import { useEffect, useState, useCallback } from 'react';
import { View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { NativeSheetHeader, NativeSheetScrollBody } from '@/components/ui/bottom-sheet';
import { useSheetContext } from '@/lib/sheet-context';
import { STATUS_OPTIONS, getStatusHexColor } from '@/lib/age-utils';
import { getIOSSheetColors } from '@/lib/ios-colors';
import type { ProjectStatus } from '@/lib/mock-data';

/**
 * Native iOS Status Select Sheet
 *
 * Stacks on top of Age Update Sheet with frosted glass background.
 * iOS Settings-style grouped table with colored status dots.
 */
export default function StatusSelectSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);

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
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
      />
    );
  }

  if (!data) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)', padding: 20 }}
      >
        <Text style={{ color: colors.subtitle }}>No data available</Text>
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
      <NativeSheetHeader>
        <Text size="lg" weight="semibold" style={{ color: colors.title }}>
          Select Status
        </Text>
      </NativeSheetHeader>

      {/* Body */}
      <NativeSheetScrollBody contentContainerStyle={{ paddingTop: 16 }}>
        <View
          style={{
            backgroundColor: colors.rowBackground,
            borderRadius: 12,
            borderCurve: 'continuous',
            overflow: 'hidden',
          }}
        >
          {STATUS_OPTIONS.map((option, index) => {
            const isSelected = selectedStatus === option.value;
            const statusColor = getStatusHexColor(option.value);
            const isLast = index === STATUS_OPTIONS.length - 1;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: pressed ? 0.7 : 1,
                      borderBottomWidth: isLast ? 0 : 0.5,
                      borderBottomColor: colors.separator,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: statusColor,
                        }}
                      />
                      <Text
                        weight={isSelected ? 'semibold' : 'regular'}
                        style={{ color: colors.title }}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Icon as={Check} size={18} color={colors.accent} />
                    ) : null}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </NativeSheetScrollBody>
    </BlurView>
  );
}
