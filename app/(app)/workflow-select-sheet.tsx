import { useState, useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react-native';

import { VStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { MOCK_WORKFLOWS, getWorkflowById } from '@/lib/mock-data';
import { useAccentColors } from '@/lib/theme-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

/**
 * Native iOS Workflow Select Sheet
 */
export default function WorkflowSelectSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';

  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#007AFF';

  const { getWorkflowSelectData, clearWorkflowSelectData } = useSheetContext();
  const data = getWorkflowSelectData();

  const [pendingWorkflow, setPendingWorkflow] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const pendingWorkflowData = pendingWorkflow ? getWorkflowById(pendingWorkflow) : null;

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectWorkflow = useCallback(
    (workflowId: string) => {
      if (workflowId === data?.currentWorkflowId) {
        clearWorkflowSelectData();
        router.back();
        return;
      }

      setPendingWorkflow(workflowId);
    },
    [data?.currentWorkflowId, clearWorkflowSelectData, router]
  );

  const handleBack = useCallback(() => {
    setPendingWorkflow(null);
  }, []);

  const handleClose = useCallback(() => {
    clearWorkflowSelectData();
    router.back();
  }, [clearWorkflowSelectData, router]);

  const handleSelectStage = useCallback(
    (stageId: string) => {
      if (pendingWorkflow && data?.onSelectWorkflow) {
        data.onSelectWorkflow(pendingWorkflow, stageId);
      }
      clearWorkflowSelectData();
      router.back();
    },
    [pendingWorkflow, data, clearWorkflowSelectData, router]
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

  // Confirmation view - selecting stage
  if (pendingWorkflow && pendingWorkflowData) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 12,
            }}
          >
            {/* Back Button */}
            <Pressable
              onPress={handleBack}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}
            >
              <Icon as={ChevronLeft} size={20} color={accentColor} />
              <Text style={{ color: accentColor }}>Back</Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text size="lg" weight="semibold" style={{ color: colors.title }}>
                Move to {pendingWorkflowData.name}
              </Text>
            </View>

            {/* Glass Close Button */}
            <Pressable onPress={handleClose}>
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
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 + insets.bottom }}>
            <VStack gap="xs">
              {pendingWorkflowData.stages.map((stage) => {
                return (
                  <Pressable
                    key={stage.id}
                    onPress={() => handleSelectStage(stage.id)}
                    style={styles.stageOption}
                  >
                    <View style={[styles.stageColor, { backgroundColor: stage.color }]} />
                    <Text style={{ flex: 1, color: colors.title }}>{stage.name}</Text>
                    <Icon as={ChevronRight} size={18} color={colors.subtitle} />
                  </Pressable>
                );
              })}
            </VStack>
          </View>
        </ScrollView>
      </BlurView>
    );
  }

  // Main workflow list view
  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
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
            Select Workflow
          </Text>

          <Pressable onPress={handleClose}>
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
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 + insets.bottom }}>
          <VStack gap="xs">
            {MOCK_WORKFLOWS.map((workflow) => {
              const isSelected = workflow.id === data.currentWorkflowId;

              return (
                <Pressable
                  key={workflow.id}
                  onPress={() => handleSelectWorkflow(workflow.id)}
                  style={[
                    styles.workflowOption,
                    isSelected && {
                      backgroundColor: accentColors?.secondary ?? 'rgba(0, 122, 255, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: isSelected ? '600' : '400',
                      color: colors.title,
                    }}
                  >
                    {workflow.name}
                  </Text>
                  {isSelected ? (
                    <Icon as={Check} size={18} color={accentColor} />
                  ) : (
                    <Icon as={ChevronRight} size={18} color={colors.subtitle} />
                  )}
                </Pressable>
              );
            })}
          </VStack>
        </View>
      </ScrollView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  workflowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 12,
  },
  stageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 12,
  },
  stageColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
