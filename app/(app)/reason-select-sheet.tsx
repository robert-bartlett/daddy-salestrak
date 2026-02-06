import { useEffect, useState, useCallback } from 'react';
import { View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { NativeSheetHeader, NativeSheetScrollBody } from '@/components/ui/bottom-sheet';
import { useSheetContext } from '@/lib/sheet-context';
import { REASON_OPTIONS } from '@/lib/age-utils';
import { getIOSSheetColors } from '@/lib/ios-colors';
import type { AgeUpdateReason } from '@/lib/mock-data';

/**
 * Native iOS Reason Select Sheet
 *
 * Stacks on top of Age Update Sheet with frosted glass background.
 * iOS Settings-style grouped table with reason options.
 */
export default function ReasonSelectSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);

  const { getReasonSelectData, clearReasonSelectData } = useSheetContext();
  const data = getReasonSelectData();

  const [selectedReason, setSelectedReason] = useState<AgeUpdateReason>(
    data?.currentReason ?? 'none'
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data?.currentReason) {
      setSelectedReason(data.currentReason);
    }
  }, [data?.currentReason]);

  const handleSelect = useCallback(
    (reason: AgeUpdateReason) => {
      if (data?.onSelect) {
        data.onSelect(reason);
      }
      clearReasonSelectData();
      router.back();
    },
    [data, clearReasonSelectData, router]
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
          Select Reason
        </Text>
      </NativeSheetHeader>

      {/* Body */}
      <NativeSheetScrollBody contentContainerStyle={{ paddingBottom: 24 }}>
        <View
          style={{
            backgroundColor: colors.rowBackground,
            borderRadius: 12,
            borderCurve: 'continuous',
            overflow: 'hidden',
          }}
        >
          {REASON_OPTIONS.map((option, index) => {
            const isSelected = selectedReason === option.value;
            const isLast = index === REASON_OPTIONS.length - 1;

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
                    <Text
                      weight={isSelected ? 'semibold' : 'regular'}
                      style={{ color: colors.title }}
                    >
                      {option.label}
                    </Text>
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
