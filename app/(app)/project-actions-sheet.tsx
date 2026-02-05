import { useEffect, useState, useCallback } from 'react';
import { Alert, Pressable, View, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Archive, ArchiveRestore, Trash2 } from 'lucide-react-native';

import { VStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSheetContext } from '@/lib/sheet-context';
import { useProjects } from '@/lib/projects-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

type ActionItem = {
  label: string;
  icon: typeof Star;
  color?: string;
  onPress: () => void;
};

/**
 * Native iOS Project Actions Sheet
 */
export default function ProjectActionsSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';
  const sheetBackground = isDark ? '#1c1c1e' : '#f2f2f7';

  const { getProjectActionsData, clearProjectActionsData } = useSheetContext();
  const { toggleFavorite, archiveProject, unarchiveProject, deleteProject } = useProjects();

  const data = getProjectActionsData();
  const project = data?.project;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    clearProjectActionsData();
    router.back();
  }, [clearProjectActionsData, router]);

  const handleToggleFavorite = useCallback(() => {
    if (project) {
      toggleFavorite(project.id);
    }
    handleClose();
  }, [project, toggleFavorite, handleClose]);

  const handleArchive = useCallback(() => {
    if (project) {
      archiveProject(project.id);
    }
    handleClose();
  }, [project, archiveProject, handleClose]);

  const handleUnarchive = useCallback(() => {
    if (project) {
      unarchiveProject(project.id);
    }
    handleClose();
  }, [project, unarchiveProject, handleClose]);

  const handleDelete = useCallback(() => {
    if (!project) return;

    Alert.alert(
      'Delete Project',
      `This cannot be undone. Delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProject(project.id);
            handleClose();
            data?.onDelete?.();
          },
        },
      ]
    );
  }, [project, deleteProject, handleClose, data]);

  if (!isMounted) {
    return <View style={{ flex: 1, backgroundColor: sheetBackground }} />;
  }

  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: sheetBackground, padding: 20 }}>
        <Text style={{ color: colors.subtitle }}>No project selected</Text>
      </View>
    );
  }

  const actions: ActionItem[] = [
    {
      label: project.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: Star,
      color: project.isFavorite ? '#FFD700' : undefined,
      onPress: handleToggleFavorite,
    },
    project.isArchived
      ? {
          label: 'Restore Project',
          icon: ArchiveRestore,
          onPress: handleUnarchive,
        }
      : {
          label: 'Archive Project',
          icon: Archive,
          onPress: handleArchive,
        },
    {
      label: 'Delete Project',
      icon: Trash2,
      color: '#EF4444',
      onPress: handleDelete,
    },
  ];

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
          {project.name}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom }}
      >
        <VStack gap="xs">
          {actions.map((action) => (
            <Pressable key={action.label} onPress={action.onPress}>
              {({ pressed }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    opacity: pressed ? 0.7 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      as={action.icon}
                      size={20}
                      color={action.color ?? colors.title}
                      fill={
                        action.label.includes('Favorites') && project.isFavorite
                          ? '#FFD700'
                          : 'none'
                      }
                    />
                  </View>
                  <Text
                    weight="medium"
                    style={{
                      color: action.color === '#EF4444' ? action.color : colors.title,
                    }}
                  >
                    {action.label}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </VStack>
      </ScrollView>
    </View>
  );
}
