import { Alert, Pressable, View } from 'react-native';
import { Star, Archive, ArchiveRestore, Trash2 } from 'lucide-react-native';

import { Box, VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useProjects } from '@/lib/projects-context';
import type { Project } from '@/lib/mock-data';

type ProjectActionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  /** Callback when the project is deleted (to close parent sheets) */
  onDelete?: () => void;
};

type ActionItem = {
  label: string;
  icon: typeof Star;
  color?: string;
  onPress: () => void;
};

export function ProjectActionsSheet({
  open,
  onOpenChange,
  project,
  onDelete,
}: ProjectActionsSheetProps) {
  const { toggleFavorite, archiveProject, unarchiveProject, deleteProject } = useProjects();

  const handleToggleFavorite = () => {
    toggleFavorite(project.id);
    onOpenChange(false);
  };

  const handleArchive = () => {
    archiveProject(project.id);
    onOpenChange(false);
  };

  const handleUnarchive = () => {
    unarchiveProject(project.id);
    onOpenChange(false);
  };

  const handleDelete = () => {
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
            onOpenChange(false);
            onDelete?.();
          },
        },
      ]
    );
  };

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false}>
        <Box padding="lg">
          <VStack gap="lg">
            <Text size="lg" weight="semibold">
              {project.name}
            </Text>

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
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon
                          as={action.icon}
                          size={20}
                          color={action.color}
                          fill={action.label.includes('Favorites') && project.isFavorite ? '#FFD700' : 'none'}
                        />
                      </View>
                      <Text
                        weight="medium"
                        style={action.color === '#EF4444' ? { color: action.color } : undefined}
                      >
                        {action.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </VStack>
          </VStack>
        </Box>
      </SheetContent>
    </Sheet>
  );
}
