import { View, Pressable } from 'react-native';
import { ChevronLeft, Moon, Sun, Check } from 'lucide-react-native';

import { Box, VStack, HStack, Header } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  useTheme,
  useAccentColors,
  ACCENT_COLORS,
  ACCENT_COLOR_VALUES,
  type AccentColor,
} from '@/lib/theme-context';

type ProfileScreenProps = {
  onBackPress: () => void;
};

// Mock current user - in a real app this would come from auth context
const CURRENT_USER = {
  name: 'John Smith',
  email: 'john.smith@company.com',
  initials: 'JS',
};

export function ProfileScreen({ onBackPress }: ProfileScreenProps) {
  const { colorMode, toggleColorMode, accentColor, setAccentColor } = useTheme();
  const accentColors = useAccentColors();

  const isDarkMode = colorMode === 'dark';

  return (
    <Box fill background="default">
      <Header
        title="Profile"
        safeAreaTop
        background="default"
        left={
          <Button variant="ghost" size="icon" onPress={onBackPress}>
            <Icon as={ChevronLeft} size={24} />
          </Button>
        }
      />

      <Box padding="lg">
        <VStack gap="xl">
          {/* User Info Section */}
          <VStack gap="md" align="center">
            <Avatar size="xl" alt={CURRENT_USER.name}>
              <AvatarFallback>
                <Text size="2xl" weight="semibold">
                  {CURRENT_USER.initials}
                </Text>
              </AvatarFallback>
            </Avatar>
            <VStack gap="xs" align="center">
              <Text size="xl" weight="semibold">
                {CURRENT_USER.name}
              </Text>
              <Text size="sm" tone="muted">
                {CURRENT_USER.email}
              </Text>
            </VStack>
          </VStack>

          {/* Appearance Section */}
          <VStack gap="md">
            <Text size="sm" weight="medium" tone="muted">
              APPEARANCE
            </Text>

            {/* Dark Mode Toggle */}
            <Pressable onPress={toggleColorMode}>
              {({ pressed }) => (
                <View
                  style={{ opacity: pressed ? 0.7 : 1 }}
                  className="flex-row items-center justify-between rounded-xl bg-card p-4"
                >
                  <HStack gap="md" align="center">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Icon as={isDarkMode ? Moon : Sun} size={20} />
                    </View>
                    <VStack gap="xs">
                      <Text weight="medium">Dark Mode</Text>
                      <Text size="sm" tone="muted">
                        {isDarkMode ? 'On' : 'Off'}
                      </Text>
                    </VStack>
                  </HStack>
                  <View
                    style={{
                      height: 32,
                      width: 56,
                      borderRadius: 16,
                      padding: 4,
                      backgroundColor: isDarkMode
                        ? accentColors?.primary ?? '#3b82f6'
                        : 'rgba(120, 120, 128, 0.3)',
                    }}
                  >
                    <View
                      style={{
                        height: 24,
                        width: 24,
                        borderRadius: 12,
                        backgroundColor: '#fff',
                        marginLeft: isDarkMode ? 'auto' : 0,
                      }}
                    />
                  </View>
                </View>
              )}
            </Pressable>

            {/* Accent Color Selection */}
            <View className="rounded-xl bg-card p-4">
              <VStack gap="md">
                <Text weight="medium">Accent Color</Text>
                <View className="flex-row flex-wrap gap-3">
                  {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => {
                    const isSelected = accentColor === color;
                    const colorValue = ACCENT_COLOR_VALUES[color];

                    return (
                      <Pressable
                        key={color}
                        onPress={() => setAccentColor(color)}
                      >
                        {({ pressed }) => (
                          <View
                            style={{
                              opacity: pressed ? 0.7 : 1,
                              width: 48,
                              height: 48,
                              borderRadius: 24,
                              backgroundColor: colorValue,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: isSelected ? 3 : 0,
                              borderColor: isDarkMode ? '#fff' : '#000',
                            }}
                          >
                            {isSelected && (
                              <Icon
                                as={Check}
                                size={24}
                                color={isDarkMode ? '#fff' : '#000'}
                              />
                            )}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
                <Text size="sm" tone="muted">
                  Selected: {ACCENT_COLORS[accentColor].label}
                </Text>
              </VStack>
            </View>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
