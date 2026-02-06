import { useEffect, useState, useCallback } from 'react';
import { View, Pressable, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { Check, X } from 'lucide-react-native';

import { VStack, HStack, Box } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

/**
 * Native iOS Stage Select Sheet
 */
export default function StageSelectSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';
  const sheetBackground = isDark ? '#1c1c1e' : '#f2f2f7';

  const { getStageSelectData, clearStageSelectData } = useSheetContext();
  const data = getStageSelectData();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectStage = useCallback(
    (stageId: string) => {
      if (data?.onSelectStage && stageId !== data.currentStageId) {
        data.onSelectStage(stageId);
      }
      clearStageSelectData();
      router.back();
    },
    [data, clearStageSelectData, router]
  );

  const handleCancel = useCallback(() => {
    clearStageSelectData();
    router.back();
  }, [clearStageSelectData, router]);

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

  const { workflow, currentStageId } = data;
  const currentIndex = workflow.stages.findIndex((s) => s.id === currentStageId);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: sheetBackground }}
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
          Change Stage
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
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 + insets.bottom }}>
        <VStack gap="xs">
          {workflow.stages.map((stage, index) => {
            const isCurrent = stage.id === currentStageId;
            const isPast = index < currentIndex;

            return (
              <Button
                key={stage.id}
                variant={isCurrent ? 'secondary' : 'ghost'}
                onPress={() => handleSelectStage(stage.id)}
              >
                <View style={{ flex: 1 }}>
                  <HStack gap="sm" align="center">
                    <Box
                      size="sm"
                      rounded="full"
                      background={isCurrent ? 'primary' : isPast ? 'accent' : 'muted'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        weight={isCurrent ? 'semibold' : 'regular'}
                        tone={isCurrent ? 'default' : 'muted'}
                      >
                        {stage.name}
                      </Text>
                    </View>
                    {isCurrent ? <Icon as={Check} size={18} /> : null}
                    <Badge variant="color" color={stage.color} size="sm">
                      <Text>{index + 1}</Text>
                    </Badge>
                  </HStack>
                </View>
              </Button>
            );
          })}
        </VStack>
      </View>
    </ScrollView>
  );
}
