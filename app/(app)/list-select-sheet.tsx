import { useState, useCallback, useEffect } from 'react';
import { View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

export default function ListSelectSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { getListSelectData, clearListSelectData } = useSheetContext();

  const data = getListSelectData();

  // For multi-select mode
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(data?.selectedIds ?? (data?.selectedId ? [data.selectedId] : []))
  );

  const handleSelect = useCallback((id: string) => {
    if (!data) return;

    if (data.allowMultiple) {
      // Multi-select mode
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      // Single select mode - select and close
      data.onSelect(id);
      router.back();
    }
  }, [data, router]);

  // Sync multi-select changes back to parent
  useEffect(() => {
    if (data?.allowMultiple && data?.onSelectMultiple) {
      data.onSelectMultiple(Array.from(selectedIds));
    }
  }, [selectedIds, data]);

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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {data.items.map((item) => {
          const isSelected = data.allowMultiple
            ? selectedIds.has(item.id)
            : data.selectedId === item.id;

          return (
            <Pressable key={item.id} onPress={() => handleSelect(item.id)}>
              {({ pressed }) => (
                <View
                  style={{
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.separator,
                  }}
                >
                  <HStack gap="md" align="center" style={{ flex: 1 }}>
                    {/* Color indicator if provided */}
                    {item.color ? (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: item.color,
                        }}
                      />
                    ) : null}

                    {/* If sublabel looks like initials (2-3 chars), show as avatar */}
                    {item.sublabel && item.sublabel.length <= 3 && !item.sublabel.includes('@') ? (
                      <Avatar size="sm" alt={item.label}>
                        <AvatarFallback>
                          <Text size="xs" style={{ color: colors.title }}>{item.sublabel}</Text>
                        </AvatarFallback>
                      </Avatar>
                    ) : null}

                    <VStack gap="xs" style={{ flex: 1 }}>
                      <Text
                        weight={isSelected ? 'semibold' : 'regular'}
                        style={{ color: colors.title }}
                      >
                        {item.label}
                      </Text>
                      {item.sublabel && (item.sublabel.length > 3 || item.sublabel.includes('@')) ? (
                        <Text size="sm" style={{ color: colors.subtitle }}>
                          {item.sublabel}
                        </Text>
                      ) : null}
                    </VStack>
                  </HStack>

                  {isSelected ? (
                    <Icon as={Check} size={20} color="#0A84FF" />
                  ) : null}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </BlurView>
  );
}
