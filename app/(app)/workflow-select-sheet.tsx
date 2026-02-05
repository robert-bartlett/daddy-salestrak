import { useState, useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronRight } from 'lucide-react-native';

import { VStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
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
  const sheetBackground = isDark ? '#1c1c1e' : '#f2f2f7';

  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#007AFF';

  const { getWorkflowSelectData, clearWorkflowSelectData } = useSheetContext();
  const data = getWorkflowSelectData();

  const [pendingWorkflow, setPendingWorkflow] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
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

      const workflow = getWorkflowById(workflowId);
      setPendingWorkflow(workflowId);
      setSelectedStageId(workflow?.stages[0]?.id ?? null);
    },
    [data?.currentWorkflowId, clearWorkflowSelectData, router]
  );

  const handleConfirmMove = useCallback(() => {
    if (pendingWorkflow && selectedStageId && data?.onSelectWorkflow) {
      data.onSelectWorkflow(pendingWorkflow, selectedStageId);
    }
    clearWorkflowSelectData();
    router.back();
  }, [pendingWorkflow, selectedStageId, data, clearWorkflowSelectData, router]);

  const handleBack = useCallback(() => {
    setPendingWorkflow(null);
    setSelectedStageId(null);
  }, []);

  const handleClose = useCallback(() => {
    clearWorkflowSelectData();
    router.back();
  }, [clearWorkflowSelectData, router]);

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

  // Confirmation view - selecting stage
  if (pendingWorkflow && pendingWorkflowData) {
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
            Move to {pendingWorkflowData.name}
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: colors.subtitle, marginBottom: 12 }}>
            Select a stage in this workflow:
          </Text>

          <VStack gap="xs">
            {pendingWorkflowData.stages.map((stage) => {
              const isSelected = stage.id === selectedStageId;

              return (
                <Pressable
                  key={stage.id}
                  onPress={() => setSelectedStageId(stage.id)}
                  style={[
                    styles.stageOption,
                    isSelected && {
                      backgroundColor: accentColors?.secondary ?? 'rgba(0, 122, 255, 0.15)',
                    },
                  ]}
                >
                  <View style={[styles.stageColor, { backgroundColor: stage.color }]} />
                  <Text style={{ flex: 1, color: colors.title }}>{stage.name}</Text>
                  {isSelected ? <Icon as={Check} size={18} color={accentColor} /> : null}
                </Pressable>
              );
            })}
          </VStack>
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            padding: 16,
            paddingBottom: 16 + insets.bottom,
            borderTopWidth: 0.5,
            borderTopColor: colors.separator,
            backgroundColor: sheetBackground,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Button variant="ghost" onPress={handleBack}>
              Back
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button onPress={handleConfirmMove} disabled={!selectedStageId}>
              Move
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // Main workflow list view
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
          Select Workflow
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
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
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          padding: 16,
          paddingBottom: 16 + insets.bottom,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          backgroundColor: sheetBackground,
        }}
      >
        <Button variant="ghost" onPress={handleClose}>
          Cancel
        </Button>
      </View>
    </View>
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
