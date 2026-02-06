import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Pressable, View, FlatList, TextInput, Keyboard, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MapPin, X } from 'lucide-react-native';

import { Box, VStack, HStack, Surface, Header } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { getWorkflowById, getStageById, type Project } from '@/lib/mock-data';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';

type SearchSheetProps = {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
};

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  console.log('SearchSheet render, open:', open);
  const { projects } = useProjects();
  const { expandProject } = useMapSheet();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // Auto-focus search input when sheet opens
  useEffect(() => {
    if (open) {
      // Small delay to allow modal animation to complete
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      // Clear search when closing
      setSearchQuery('');
    }
  }, [open]);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.address.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleProjectPress = useCallback((projectId: string) => {
    Keyboard.dismiss();
    onOpenChange(false);
    // Delay expanding project to let modal close first
    setTimeout(() => {
      expandProject(projectId);
    }, 100);
  }, [onOpenChange, expandProject]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onOpenChange(false);
  }, [onOpenChange]);

  const renderProject = ({ item: project }: { item: Project }) => {
    const workflow = getWorkflowById(project.workflowId);
    const stage = getStageById(project.workflowId, project.stageId);
    const stageColor = stage ? getPinColor(stage.color) : '#6B7280';

    return (
      <Pressable onPress={() => handleProjectPress(project.id)}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>
            <Surface variant="card" padding="md">
              <VStack gap="xs">
                <HStack justify="between" align="center">
                  <Text weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
                    {project.name}
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{ color: getStatusHexColor(getStatusFromAge(project.ageResetAt)) }}
                  >
                    {formatAge(project.ageResetAt)}
                  </Text>
                </HStack>
                <HStack gap="xs" align="center">
                  <Icon as={MapPin} size={12} />
                  <Text size="sm" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                    {project.address}
                  </Text>
                </HStack>
                {stage ? (
                  <HStack gap="xs" align="center">
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: stageColor,
                      }}
                    />
                    <Text size="xs" tone="muted">
                      {workflow?.name} · {stage.name}
                    </Text>
                  </HStack>
                ) : null}
              </VStack>
            </Surface>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      transparent
    >
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
      >
        {/* Handle indicator */}
        <View style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 2 }}>
          <View
            style={{
              width: 36,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }}
          />
        </View>

        <Header
          title="Search"
          background="default"
          safeAreaTop={false}
          right={
            <Button variant="ghost" size="icon" onPress={handleClose}>
              <Icon as={X} size={22} />
            </Button>
          }
        />

        {/* Search Input */}
        <Box paddingX="md" paddingY="sm">
          <HStack gap="sm" align="center">
            <View style={{ flex: 1 }}>
              <Input
                ref={inputRef}
                placeholder="Search projects..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                width="full"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
            </View>
            {searchQuery.length > 0 ? (
              <Button variant="ghost" size="icon" onPress={() => setSearchQuery('')}>
                <Icon as={X} size={18} />
              </Button>
            ) : null}
          </HStack>
        </Box>

        {/* Results count */}
        <Box paddingX="md" paddingY="sm">
          <Text size="sm" tone="muted">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          </Text>
        </Box>

        {/* Project List */}
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={renderProject}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 40 + insets.bottom,
            gap: 8
          }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Surface variant="muted" padding="xl">
              <Text tone="muted" align="center">
                {searchQuery ? 'No projects match your search' : 'No projects yet'}
              </Text>
            </Surface>
          }
        />
      </BlurView>
    </Modal>
  );
}
