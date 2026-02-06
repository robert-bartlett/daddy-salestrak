import { useState, useCallback, useEffect } from 'react';
import { View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { MOCK_USERS } from '@/lib/mock-data';

export default function UserSelectSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { getUserSelectData, clearUserSelectData } = useSheetContext();

  const data = getUserSelectData();
  const [selected, setSelected] = useState<string[]>(data?.selected ?? []);

  // Sync changes back to parent
  useEffect(() => {
    if (data?.onSelectedChange) {
      data.onSelectedChange(selected);
    }
  }, [selected, data]);

  const toggleUser = useCallback((userId: string) => {
    setSelected((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  }, []);

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
          {data.title}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 8 }}
      >
        {MOCK_USERS.map((user) => {
          const isSelected = selected.includes(user.id);
          return (
            <Pressable key={user.id} onPress={() => toggleUser(user.id)}>
              {({ pressed }) => (
                <View
                  style={{
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: isSelected ? 'rgba(10, 132, 255, 0.15)' : colors.rowBackground,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    padding: 12,
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? '#0A84FF' : 'transparent',
                  }}
                >
                  <HStack justify="between" align="center">
                    <HStack gap="sm" align="center">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.separator,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text size="sm" weight="semibold" style={{ color: colors.title }}>
                          {user.initials}
                        </Text>
                      </View>
                      <VStack gap="none">
                        <Text
                          weight={isSelected ? 'semibold' : 'regular'}
                          style={{ color: isSelected ? '#0A84FF' : colors.title }}
                        >
                          {user.name}
                        </Text>
                        <Text size="sm" style={{ color: colors.subtitle }}>{user.email}</Text>
                      </VStack>
                    </HStack>
                    {isSelected ? (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: '#0A84FF',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon as={Check} size={14} color="#fff" />
                      </View>
                    ) : null}
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
