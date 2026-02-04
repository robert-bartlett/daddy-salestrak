import { useState, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import { FolderKanban, UserCircle, Building2, MapPin, ChevronRight } from 'lucide-react-native';

import { BottomSheetScrollBody, BottomSheetHeader } from '@/components/ui/bottom-sheet';
import { VStack, HStack, Surface } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useMapSheet, type Coordinates } from '@/lib/map-sheet-context';
import { ProjectForm } from './_project-form';
import { ContactForm } from './_contact-form';
import { AccountForm } from './_account-form';

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

export function AddSheetContent() {
  const { appState, closeSheet, isSheetVisible, setSnapPoint } = useMapSheet();

  // Get coordinates from app state if available
  const coordinates = appState.type === 'tab' && appState.tab === 'add' ? appState.coordinates : undefined;

  // View state - start with entity-selection, will be set by effect
  const [viewState, setViewState] = useState<ViewState>({ view: 'entity-selection' });

  // Track previous values to detect changes
  const prevCoordinatesRef = useRef<Coordinates | undefined>(undefined);
  const prevVisibleRef = useRef(false);

  // Handle sheet visibility and coordinate changes
  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    const isVisible = isSheetVisible;
    const hadCoordinates = prevCoordinatesRef.current;
    const hasCoordinates = coordinates;

    // Sheet just opened
    if (!wasVisible && isVisible) {
      // If opened with coordinates (map tap), go to project form
      // Otherwise, show entity selection
      const initialView = hasCoordinates ? 'project-form' : 'entity-selection';
      setViewState({ view: initialView });
    }
    // Sheet is visible and coordinates changed (new map tap while sheet is open)
    else if (isVisible && hasCoordinates && !hadCoordinates) {
      setViewState({ view: 'project-form' });
    }
    // Sheet just closed - reset for next time
    else if (wasVisible && !isVisible) {
      setViewState({ view: 'entity-selection' });
    }

    prevVisibleRef.current = isVisible;
    prevCoordinatesRef.current = hasCoordinates;
  }, [isSheetVisible, coordinates]);

  // Navigate to a form
  const navigateToForm = (view: 'project-form' | 'contact-form' | 'account-form') => {
    setViewState({ view });
  };

  const handleBack = () => {
    // If we came from a map tap (coordinates present), back should close the sheet
    // Otherwise, go back to entity selection
    if (coordinates) {
      closeSheet();
    } else {
      setViewState({ view: 'entity-selection' });
    }
  };

  const handleCancel = () => {
    setViewState({ view: 'entity-selection' });
    closeSheet();
  };

  // Render the appropriate view based on state
  if (viewState.view === 'project-form') {
    return (
      <ProjectForm
        coordinates={coordinates}
        onBack={handleBack}
        onCancel={handleCancel}
      />
    );
  }

  if (viewState.view === 'contact-form') {
    return (
      <ContactForm
        onBack={handleBack}
        onCancel={handleCancel}
      />
    );
  }

  if (viewState.view === 'account-form') {
    return (
      <AccountForm
        onBack={handleBack}
        onCancel={handleCancel}
      />
    );
  }

  // Entity selection screen
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

  return (
    <>
      <BottomSheetHeader>
        <VStack gap="xs">
          <Text size="lg" weight="semibold">
            Create New
          </Text>
          <Text size="sm" tone="muted">
            Choose what you want to create
          </Text>
        </VStack>
      </BottomSheetHeader>

      <BottomSheetScrollBody contentContainerStyle={{ paddingBottom: 40 }}>
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
      </BottomSheetScrollBody>
    </>
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
