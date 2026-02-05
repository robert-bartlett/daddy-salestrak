import { useState, useCallback } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FolderKanban, UserCircle, Building2, MapPin, ChevronRight } from 'lucide-react-native';

import { VStack, HStack, Surface, Box } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ProjectForm } from './components/_project-form';
import { ContactForm } from './components/_contact-form';
import { AccountForm } from './components/_account-form';

type ViewState =
  | { view: 'entity-selection' }
  | { view: 'project-form' }
  | { view: 'contact-form' }
  | { view: 'account-form' };

type EntityOption = {
  id: string;
  icon: typeof FolderKanban;
  title: string;
  description: string;
  onPress: () => void;
};

/**
 * Native iOS Add Sheet
 *
 * Presented as a native formSheet with:
 * - Native iOS frosted glass blur effect
 * - Native detent snapping (50%, 92%)
 * - Native drag handle
 */
export default function AddSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();

  // Parse coordinates from params if provided
  const coordinates = params.lat && params.lng
    ? { latitude: parseFloat(params.lat), longitude: parseFloat(params.lng) }
    : undefined;

  // Start with project form if coordinates are provided (map tap)
  const [viewState, setViewState] = useState<ViewState>(
    coordinates ? { view: 'project-form' } : { view: 'entity-selection' }
  );

  const handleDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const handleBack = useCallback(() => {
    if (coordinates) {
      // If opened from map tap, back should dismiss
      handleDismiss();
    } else {
      setViewState({ view: 'entity-selection' });
    }
  }, [coordinates, handleDismiss]);

  const navigateToForm = useCallback((view: 'project-form' | 'contact-form' | 'account-form') => {
    setViewState({ view });
  }, []);

  // Render project form
  if (viewState.view === 'project-form') {
    return (
      <View style={{ flex: 1 }}>
        <ProjectForm
          coordinates={coordinates}
          onBack={handleBack}
          onCancel={handleDismiss}
        />
      </View>
    );
  }

  // Render contact form
  if (viewState.view === 'contact-form') {
    return (
      <View style={{ flex: 1 }}>
        <ContactForm
          onBack={handleBack}
          onCancel={handleDismiss}
        />
      </View>
    );
  }

  // Render account form
  if (viewState.view === 'account-form') {
    return (
      <View style={{ flex: 1 }}>
        <AccountForm
          onBack={handleBack}
          onCancel={handleDismiss}
        />
      </View>
    );
  }

  // Entity selection options
  const entityOptions: EntityOption[] = [
    {
      id: 'project',
      icon: FolderKanban,
      title: 'Project',
      description: 'Track a job, lead, or property',
      onPress: () => navigateToForm('project-form'),
    },
    {
      id: 'contact',
      icon: UserCircle,
      title: 'Contact',
      description: 'Add a person to your network',
      onPress: () => navigateToForm('contact-form'),
    },
    {
      id: 'account',
      icon: Building2,
      title: 'Account',
      description: 'Create a company or organization',
      onPress: () => navigateToForm('account-form'),
    },
  ];

  // Entity selection screen
  return (
    <Box fill background="default">
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <VStack gap="xs">
          <Text size="lg" weight="semibold">
            Create New
          </Text>
          <Text size="sm" tone="muted">
            Choose what you want to create
          </Text>
        </VStack>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <VStack gap="md">
          {entityOptions.map((option) => (
            <EntityOptionCard key={option.id} option={option} />
          ))}

          {/* Location indicator if coordinates are set */}
          {coordinates ? (
            <Surface variant="muted" padding="md" rounded="lg">
              <HStack gap="sm" align="center">
                <Icon as={MapPin} size={16} color="#22c55e" />
                <VStack gap="xs">
                  <Text size="sm" weight="medium">
                    Location Selected
                  </Text>
                  <Text size="xs" tone="muted">
                    New projects will use this map location
                  </Text>
                </VStack>
              </HStack>
            </Surface>
          ) : null}
        </VStack>
      </ScrollView>
    </Box>
  );
}

function EntityOptionCard({ option }: { option: EntityOption }) {
  const { icon: IconComponent, title, description, onPress } = option;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Surface
          variant="outline"
          padding="md"
          rounded="lg"
        >
          <HStack gap="md" align="center" justify="between">
            <HStack gap="md" align="center">
              <Surface variant="muted" padding="sm" rounded="md">
                <Icon as={IconComponent} size={24} />
              </Surface>
              <VStack gap="xs">
                <Text weight="semibold">{title}</Text>
                <Text size="sm" tone="muted">
                  {description}
                </Text>
              </VStack>
            </HStack>
            <Icon as={ChevronRight} size={20} />
          </HStack>
        </Surface>
      )}
    </Pressable>
  );
}
