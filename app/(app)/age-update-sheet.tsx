import { useState, useEffect, useCallback } from 'react';
import { View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { ChevronRight, X } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { NativeSheetScrollBody } from '@/components/ui/bottom-sheet';
import { useSheetContext } from '@/lib/sheet-context';
import { STATUS_OPTIONS, REASON_OPTIONS, getStatusHexColor } from '@/lib/age-utils';
import { getIOSSheetColors } from '@/lib/ios-colors';
import type { ProjectStatus, AgeUpdateReason } from '@/lib/mock-data';

/**
 * Native iOS Age Update Sheet
 *
 * Uses frosted glass blur effect matching project-sheet pattern.
 * iOS Settings-style grouped table rows for status, reason, and note.
 */
export default function AgeUpdateSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);

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
      {/* Body */}
      <NativeSheetScrollBody
        contentContainerStyle={{ paddingBottom: 20, gap: 20, paddingTop: 14 }}
      >
        {/* Header — title + X inline */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
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

        {/* Status Section */}
        <View style={{ gap: 6 }}>
          <Text
            size="sm"
            weight="medium"
            style={{ color: colors.subtitle, paddingLeft: 4 }}
          >
            Status
          </Text>
          <Pressable onPress={handleOpenStatusSelect}>
            {({ pressed }) => (
              <View
                style={{
                  backgroundColor: colors.rowBackground,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Text style={{ color: colors.title }}>Status</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: selectedStatusColor,
                    }}
                  />
                  <Text style={{ color: colors.subtitle }}>{selectedStatusLabel}</Text>
                  <Icon as={ChevronRight} size={16} color={colors.subtitle} />
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* Reason Section */}
        <View style={{ gap: 6 }}>
          <Text
            size="sm"
            weight="medium"
            style={{ color: colors.subtitle, paddingLeft: 4 }}
          >
            Reason
          </Text>
          <Pressable onPress={handleOpenReasonSelect}>
            {({ pressed }) => (
              <View
                style={{
                  backgroundColor: colors.rowBackground,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Text style={{ color: colors.title }}>Reason</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: colors.subtitle }}>{selectedReasonLabel}</Text>
                  <Icon as={ChevronRight} size={16} color={colors.subtitle} />
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* Note Section */}
        <View style={{ gap: 6 }}>
          <Text
            size="sm"
            weight="medium"
            style={{ color: colors.subtitle, paddingLeft: 4 }}
          >
            Note
          </Text>
          <View
            style={{
              backgroundColor: colors.rowBackground,
              borderRadius: 12,
              borderCurve: 'continuous',
              overflow: 'hidden',
            }}
          >
            <Textarea
              placeholder="Add a note..."
              value={note}
              onChangeText={setNote}
              numberOfLines={3}
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </View>
        </View>
      </NativeSheetScrollBody>

      {/* Footer */}
      <View
        style={{
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          padding: 16,
          paddingBottom: 16 + insets.bottom,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={handleCancel} style={{ flex: 1 }}>
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                style={{
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Text weight="medium" style={{ color: '#FFFFFF' }}>
                  Cancel
                </Text>
              </GlassView>
            )}
          </Pressable>
          <Pressable onPress={handleSubmit} style={{ flex: 1 }}>
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                style={{
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Text weight="semibold" style={{ color: '#FFFFFF' }}>
                  Reset Age
                </Text>
              </GlassView>
            )}
          </Pressable>
        </View>
      </View>
    </BlurView>
  );
}
