import { useState, useCallback } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Moon,
  Sun,
  Check,
  Bell,
  Volume2,
  CircleDot,
  Wifi,
  RefreshCw,
  Clock,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';

import { Box, VStack, HStack, Surface, Header } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
import { useUser } from '@/lib/user-context';
import { useWorkspace } from '@/lib/workspace-context';
import {
  useTheme,
  useAccentColors,
  ACCENT_COLORS,
  ACCENT_COLOR_VALUES,
  type AccentColor,
} from '@/lib/theme-context';
import {
  useSettings,
  SYNC_INTERVAL_LABELS,
  type SyncInterval,
} from '@/lib/settings-context';
import { ProfileEditSheet } from './_profile-edit-sheet';
import { WorkspaceSelectorSheet } from './_workspace-selector-sheet';

type ProfileScreenProps = {
  onBackPress: () => void;
};

// ============================================================================
// Role Badge Colors
// ============================================================================

const ROLE_BADGE_COLORS = {
  owner: 'purple' as const,
  admin: 'blue' as const,
  member: 'grey' as const,
};

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

// ============================================================================
// Native-style Setting Row Components
// ============================================================================

type SettingRowProps = {
  icon?: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  destructive?: boolean;
};

function SettingRow({
  icon,
  label,
  value,
  onPress,
  right,
  isFirst,
  isLast,
  destructive,
}: SettingRowProps) {
  const content = (
    <HStack justify="between" align="center" gap="md">
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {icon ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="bg-muted"
          >
            <Icon as={icon} size={16} tone="muted" />
          </View>
        ) : null}
        <Text
          weight="regular"
          style={destructive ? { color: '#ef4444' } : undefined}
        >
          {label}
        </Text>
      </View>
      {right ? (
        right
      ) : value ? (
        <Text tone="muted" size="sm">
          {value}
        </Text>
      ) : onPress ? (
        <Icon as={ChevronRight} size={16} tone="muted" />
      ) : null}
    </HStack>
  );

  const rowStyle = {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: isFirst ? 10 : 0,
    borderTopRightRadius: isFirst ? 10 : 0,
    borderBottomLeftRadius: isLast ? 10 : 0,
    borderBottomRightRadius: isLast ? 10 : 0,
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <View
            style={[rowStyle, { opacity: pressed ? 0.7 : 1 }]}
            className="bg-card"
          >
            {content}
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={rowStyle} className="bg-card">
      {content}
    </View>
  );
}

function SettingDivider() {
  return (
    <View className="bg-card">
      <View
        style={{ height: 0.5, marginLeft: 52 }}
        className="bg-border"
      />
    </View>
  );
}

type SettingGroupProps = {
  label?: string;
  footer?: string;
  children: React.ReactNode;
};

function SettingGroup({ label, footer, children }: SettingGroupProps) {
  return (
    <VStack gap="xs">
      {label ? (
        <Text
          size="xs"
          tone="muted"
          style={{ paddingHorizontal: 16, paddingBottom: 4, textTransform: 'uppercase' }}
        >
          {label}
        </Text>
      ) : null}
      <View style={{ borderRadius: 10, overflow: 'hidden' }}>
        {children}
      </View>
      {footer ? (
        <Text
          size="xs"
          tone="muted"
          style={{ paddingHorizontal: 16, paddingTop: 4 }}
        >
          {footer}
        </Text>
      ) : null}
    </VStack>
  );
}

// ============================================================================
// Sync Interval Selector Sheet
// ============================================================================

type SyncIntervalSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: SyncInterval;
  onValueChange: (value: SyncInterval) => void;
};

function SyncIntervalSheet({
  open,
  onOpenChange,
  value,
  onValueChange,
}: SyncIntervalSheetProps) {
  const accentColors = useAccentColors();
  const intervals: SyncInterval[] = ['5min', '15min', '30min', '1hour', 'manual'];

  const handleSelect = useCallback(
    (interval: SyncInterval) => {
      onValueChange(interval);
      onOpenChange(false);
    },
    [onValueChange, onOpenChange]
  );

  return (
    <BottomSheetModal open={open} onOpenChange={onOpenChange} snapPoints={['40%']}>
      <BottomSheetHeader>
        <BottomSheetTitle>Sync Interval</BottomSheetTitle>
      </BottomSheetHeader>
      <BottomSheetBody>
        <SettingGroup>
          {intervals.map((interval, index) => {
            const isSelected = interval === value;
            return (
              <View key={interval}>
                {index > 0 ? <SettingDivider /> : null}
                <SettingRow
                  label={SYNC_INTERVAL_LABELS[interval]}
                  onPress={() => handleSelect(interval)}
                  isFirst={index === 0}
                  isLast={index === intervals.length - 1}
                  right={
                    isSelected ? (
                      <Icon
                        as={Check}
                        size={20}
                        color={accentColors?.primary ?? '#3b82f6'}
                      />
                    ) : null
                  }
                />
              </View>
            );
          })}
        </SettingGroup>
      </BottomSheetBody>
    </BottomSheetModal>
  );
}

// ============================================================================
// Main Profile Screen
// ============================================================================

export function ProfileScreen({ onBackPress }: ProfileScreenProps) {
  const { profile } = useUser();
  const { currentWorkspace } = useWorkspace();
  const { colorMode, toggleColorMode, accentColor, setAccentColor } = useTheme();
  const accentColors = useAccentColors();
  const { notifications, data, updateNotificationSettings, updateDataSettings, clearCache } =
    useSettings();

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [workspaceSelectorOpen, setWorkspaceSelectorOpen] = useState(false);
  const [syncIntervalSheetOpen, setSyncIntervalSheetOpen] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const isDarkMode = colorMode === 'dark';

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. Your settings and account data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearingCache(true);
            try {
              await clearCache();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch {
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setIsClearingCache(false);
            }
          },
        },
      ]
    );
  }, [clearCache]);

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

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section - Tappable */}
        <Pressable onPress={() => setEditSheetOpen(true)}>
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.7 : 1 }}>
              <Surface variant="card" padding="md" rounded="xl">
                <HStack justify="between" align="center">
                  <HStack gap="md" align="center">
                    <Avatar size="lg" alt={profile.name}>
                      {profile.avatar ? (
                        <AvatarImage source={{ uri: profile.avatar }} />
                      ) : (
                        <AvatarFallback>
                          <Text size="lg" weight="semibold">
                            {profile.initials}
                          </Text>
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <VStack gap="xs">
                      <Text size="lg" weight="semibold">
                        {profile.name}
                      </Text>
                      <Text size="sm" tone="muted">
                        {profile.email}
                      </Text>
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRight} size={20} tone="muted" />
                </HStack>
              </Surface>
            </View>
          )}
        </Pressable>

        {/* Workspace Section */}
        <SettingGroup label="Workspace">
          <SettingRow
            icon={Building2}
                        label={currentWorkspace?.name ?? 'No Workspace'}
            onPress={() => setWorkspaceSelectorOpen(true)}
            isFirst
            isLast
            right={
              <HStack gap="sm" align="center">
                {currentWorkspace ? (
                  <Badge
                    variant="color"
                    color={ROLE_BADGE_COLORS[currentWorkspace.role]}
                    size="sm"
                  >
                    <Text size="xs">{ROLE_LABELS[currentWorkspace.role]}</Text>
                  </Badge>
                ) : null}
                <Icon as={ChevronRight} size={16} tone="muted" />
              </HStack>
            }
          />
        </SettingGroup>

        {/* Appearance Section */}
        <SettingGroup label="Appearance">
          <SettingRow
            icon={isDarkMode ? Moon : Sun}
                        label="Dark Mode"
            isFirst
            isLast
            right={
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleColorMode}
              />
            }
          />
        </SettingGroup>

        {/* Accent Color */}
        <SettingGroup label="Accent Color">
          <View
            style={{
              borderRadius: 10,
              padding: 16,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
            }}
            className="bg-card"
          >
            {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => {
              const isSelected = accentColor === color;
              const colorValue = ACCENT_COLOR_VALUES[color];

              return (
                <Pressable key={color} onPress={() => setAccentColor(color)}>
                  {({ pressed }) => (
                    <View
                      style={{
                        opacity: pressed ? 0.7 : 1,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colorValue,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: isDarkMode ? '#fff' : '#000',
                      }}
                    >
                      {isSelected ? (
                        <Icon
                          as={Check}
                          size={20}
                          color={isDarkMode ? '#fff' : '#000'}
                        />
                      ) : null}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </SettingGroup>

        {/* Notifications Section */}
        <SettingGroup label="Notifications">
          <SettingRow
            icon={Bell}
                        label="Push Notifications"
            isFirst
            right={
              <Switch
                checked={notifications.pushEnabled}
                onCheckedChange={(value) =>
                  updateNotificationSettings({ pushEnabled: value })
                }
              />
            }
          />
          <SettingDivider />
          <SettingRow
            icon={Volume2}
                        label="Sounds"
            right={
              <Switch
                checked={notifications.soundEnabled}
                onCheckedChange={(value) =>
                  updateNotificationSettings({ soundEnabled: value })
                }
              />
            }
          />
          <SettingDivider />
          <SettingRow
            icon={CircleDot}
                        label="Badges"
            isLast
            right={
              <Switch
                checked={notifications.badgesEnabled}
                onCheckedChange={(value) =>
                  updateNotificationSettings({ badgesEnabled: value })
                }
              />
            }
          />
        </SettingGroup>

        {/* Data & Storage Section */}
        <SettingGroup label="Data & Storage">
          <SettingRow
            icon={Wifi}
                        label="Offline Mode"
            isFirst
            right={
              <Switch
                checked={data.offlineModeEnabled}
                onCheckedChange={(value) =>
                  updateDataSettings({ offlineModeEnabled: value })
                }
              />
            }
          />
          <SettingDivider />
          <SettingRow
            icon={RefreshCw}
                        label="Auto-Sync"
            right={
              <Switch
                checked={data.autoSyncEnabled}
                onCheckedChange={(value) =>
                  updateDataSettings({ autoSyncEnabled: value })
                }
              />
            }
          />
          <SettingDivider />
          <SettingRow
            icon={Clock}
                        label="Sync Interval"
            value={SYNC_INTERVAL_LABELS[data.syncInterval]}
            onPress={() => setSyncIntervalSheetOpen(true)}
            isLast
          />
        </SettingGroup>

        {/* Danger Zone */}
        <SettingGroup footer={isClearingCache ? 'Clearing cache...' : undefined}>
          <SettingRow
            icon={Trash2}
                        label="Clear Cache"
            onPress={handleClearCache}
            isFirst
            isLast
            destructive
          />
        </SettingGroup>
      </ScrollView>

      {/* Profile Edit Sheet */}
      <ProfileEditSheet open={editSheetOpen} onOpenChange={setEditSheetOpen} />

      {/* Workspace Selector Sheet */}
      <WorkspaceSelectorSheet
        open={workspaceSelectorOpen}
        onOpenChange={setWorkspaceSelectorOpen}
      />

      {/* Sync Interval Sheet */}
      <SyncIntervalSheet
        open={syncIntervalSheetOpen}
        onOpenChange={setSyncIntervalSheetOpen}
        value={data.syncInterval}
        onValueChange={(value) => updateDataSettings({ syncInterval: value })}
      />
    </Box>
  );
}
