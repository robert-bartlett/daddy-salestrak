import { useState, useMemo, useRef, useEffect } from 'react';
import { Pressable, View, FlatList, TextInput, Keyboard } from 'react-native';
import { Map, MapPin, X, User } from 'lucide-react-native';

import { Box, VStack, HStack, Surface, Header } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useScreenNavigation } from '@/lib/screen-navigation-context';
import { getWorkflowById, getStageById, type Project } from '@/lib/mock-data';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';

type SearchScreenProps = {
  /** Callback when back button is pressed */
  onBackPress: () => void;
  /** Whether this screen is currently active (for auto-focus) */
  isActive?: boolean;
};

export function SearchScreen({ onBackPress, isActive }: SearchScreenProps) {
  const { projects } = useProjects();
  const { expandProject } = useMapSheet();
  const { navigateToProfile } = useScreenNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Track mount state to prevent state updates on unmounted component
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Auto-focus search input when screen becomes active
  useEffect(() => {
    if (isActive) {
      // Small delay to allow animation to start
      const timeout = setTimeout(() => {
        if (isMounted.current) {
          inputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      // Dismiss keyboard when leaving screen
      Keyboard.dismiss();
      if (isMounted.current) {
        setSearchQuery('');
      }
    }
  }, [isActive]);

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

  const handleProjectPress = (projectId: string) => {
    Keyboard.dismiss();
    expandProject(projectId);
    onBackPress();
  };

  const handleBackPress = () => {
    Keyboard.dismiss();
    onBackPress();
  };

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
                {stage && (
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
                )}
              </VStack>
            </Surface>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <Box fill background="default">
      <Header
        title="Search"
        safeAreaTop
        background="default"
        left={
          <Button variant="ghost" size="icon" onPress={navigateToProfile}>
            <Icon as={User} size={22} />
          </Button>
        }
        right={
          <Button variant="ghost" size="icon" onPress={handleBackPress}>
            <Icon as={Map} size={22} />
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
          {searchQuery.length > 0 && (
            <Button variant="ghost" size="icon" onPress={() => setSearchQuery('')}>
              <Icon as={X} size={18} />
            </Button>
          )}
        </HStack>
      </Box>

      {/* Results count */}
      <Box paddingX="md">
        <Text size="sm" tone="muted">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        </Text>
      </Box>

      {/* Project List */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 8 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Surface variant="muted" padding="xl">
            <Text tone="muted" align="center">
              {searchQuery ? 'No projects match your search' : 'No projects yet'}
            </Text>
          </Surface>
        }
      />
    </Box>
  );
}
