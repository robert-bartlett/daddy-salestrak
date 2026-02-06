import { useState, useEffect, useCallback } from 'react';
import { View, Pressable, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { ChevronRight, X } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { STATUS_OPTIONS, REASON_OPTIONS, getStatusHexColor } from '@/lib/age-utils';
import { getIOSSheetColors } from '@/lib/ios-colors';
import type { ProjectStatus, AgeUpdateReason } from '@/lib/mock-data';

/**
 * Native iOS Age Update Sheet
 */
export default function AgeUpdateSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';
  const sheetBackground = isDark ? '#1c1c1e' : '#f2f2f7';

  const { getAgeUpdateData, clearAgeUpdateData, openStatusSelectSheet, openReasonSelectSheet } =
    useSheetContext();

  const data = getAgeUpdateData();

  const [status, setStatus] = useState<ProjectStatus>('on_track');
  const [reason, setReason] = useState<AgeUpdateReason>('none');
  const [note, setNote] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(() => {
    if (data?.onSubmit) {
      data.onSubmit(status, reason, note.trim() || undefined);
    }
    clearAgeUpdateData();
    router.back();
  }, [data, status, reason, note, clearAgeUpdateData, router]);

  const handleCancel = useCallback(() => {
    clearAgeUpdateData();
    router.back();
  }, [clearAgeUpdateData, router]);

  const handleOpenStatusSelect = useCallback(() => {
    openStatusSelectSheet({
      currentStatus: status,
      onSelect: (selectedStatus) => {
        setStatus(selectedStatus);
      },
    });
  }, [status, openStatusSelectSheet]);

  const handleOpenReasonSelect = useCallback(() => {
    openReasonSelectSheet({
      currentReason: reason,
      onSelect: (selectedReason) => {
        setReason(selectedReason);
      },
    });
  }, [reason, openReasonSelectSheet]);

  const selectedStatusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
  const selectedStatusLabel = selectedStatusOption?.label ?? 'On track';
  const selectedStatusColor = getStatusHexColor(status);
  const selectedReasonLabel = REASON_OPTIONS.find((opt) => opt.value === reason)?.label ?? 'None';

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
      <ScrollView
        style={{ flex: 1, backgroundColor: sheetBackground }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <Text size="lg" weight="semibold" style={{ color: colors.title }}>
            Update Age
          </Text>

          <Pressable onPress={handleCancel}>
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Icon as={X} size={18} color="#FFFFFF" />
              </GlassView>
            )}
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, gap: 20 }}>
          {/* Status Selection */}
          <VStack gap="sm">
            <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
              Status
            </Text>
            <Button variant="outline" onPress={handleOpenStatusSelect}>
              <View style={{ flex: 1 }}>
                <HStack justify="between" align="center">
                  <HStack gap="sm" align="center">
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: selectedStatusColor,
                      }}
                    />
                    <Text>{selectedStatusLabel}</Text>
                  </HStack>
                  <Icon as={ChevronRight} size={20} />
                </HStack>
              </View>
            </Button>
          </VStack>

          {/* Reason Selection */}
          <VStack gap="sm">
            <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
              Reason
            </Text>
            <Button variant="outline" onPress={handleOpenReasonSelect}>
              <View style={{ flex: 1 }}>
                <HStack justify="between" align="center">
                  <Text>{selectedReasonLabel}</Text>
                  <Icon as={ChevronRight} size={20} />
                </HStack>
              </View>
            </Button>
          </VStack>

          {/* Note Textarea */}
          <VStack gap="sm">
            <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
              Note
            </Text>
            <Textarea
              placeholder="Add a note..."
              value={note}
              onChangeText={setNote}
              numberOfLines={3}
            />
          </VStack>
        </View>
      </ScrollView>

      {/* Footer - Fixed at bottom */}
      <View
        style={{
          padding: 16,
          paddingBottom: 16 + insets.bottom,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          backgroundColor: sheetBackground,
        }}
      >
        <HStack gap="sm">
          <View style={{ flex: 1 }}>
            <Button variant="ghost" onPress={handleCancel}>
              Cancel
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button onPress={handleSubmit}>Reset Age</Button>
          </View>
        </HStack>
      </View>
    </View>
  );
}
