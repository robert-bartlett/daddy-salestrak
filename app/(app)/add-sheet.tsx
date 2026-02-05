import { useState, useCallback, useEffect } from 'react';
import { View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FolderKanban, UserCircle, Building2, MapPin, ChevronRight } from 'lucide-react-native';

import { VStack, HStack, Surface } from '@/components/ui/layout';
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
  console.log('=== AddSheet RENDERING ===');

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

  // Delay rendering to avoid "state update on unmounted component" with native sheets
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // Small delay to let the native sheet fully present before rendering content
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Get color scheme for proper theming (needed early for placeholder)
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  // Wait for mount before rendering forms to avoid "state update on unmounted component"
  if (!isMounted) {
    // iOS systemGroupedBackground color
    const placeholderBg = isDark ? '#000000' : '#f2f2f7';
    return <View style={{ flex: 1, backgroundColor: placeholderBg }} />;
  }

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

  // iOS System Colors per Apple HIG
  // https://developer.apple.com/design/human-interface-guidelines/color
  const colors = {
    // Sheet background: systemGroupedBackground
    sheetBackground: isDark ? '#000000' : '#f2f2f7',
    // Card background: secondarySystemGroupedBackground
    cardBackground: isDark ? '#1c1c1e' : '#ffffff',
    // Text colors
    label: isDark ? '#ffffff' : '#000000',
    secondaryLabel: isDark ? '#ebebf5' : '#3c3c43',
    tertiaryLabel: isDark ? '#ebebf54d' : '#3c3c4399',
    // Separator
    separator: isDark ? '#38383a' : '#c6c6c8',
    // System fill for icon backgrounds
    tertiaryFill: isDark ? '#767680' : '#767680',
  };

  // Entity selection screen with iOS system colors
  return (
    <View style={{ flex: 1, backgroundColor: colors.sheetBackground }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
        {/* Header */}
        <Text size="lg" weight="semibold" style={{ color: colors.label }}>
          Create New
        </Text>

        {/* Entity options - iOS grouped style cards */}
        {entityOptions.map((option) => (
          <EntityOptionCard key={option.id} option={option} colors={colors} />
        ))}

        {/* Location indicator if coordinates are set */}
        {coordinates ? (
          <View
            style={{
              backgroundColor: colors.cardBackground,
              padding: 12,
              borderRadius: 10,
              borderCurve: 'continuous',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon as={MapPin} size={16} color="#34c759" />
            <View style={{ gap: 2 }}>
              <Text size="sm" weight="medium" style={{ color: colors.label }}>
                Location Selected
              </Text>
              <Text size="xs" style={{ color: colors.secondaryLabel }}>
                New projects will use this map location
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

type Colors = {
  sheetBackground: string;
  cardBackground: string;
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  separator: string;
  tertiaryFill: string;
};

function EntityOptionCard({ option, colors }: { option: EntityOption; colors: Colors }) {
  const { icon: IconComponent, title, description, onPress } = option;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 10,
            borderCurve: 'continuous',
            padding: 12,
            opacity: pressed ? 0.7 : 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  backgroundColor: `${colors.tertiaryFill}33`,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon as={IconComponent} size={18} color={colors.label} />
              </View>
              <View style={{ gap: 2 }}>
                <Text weight="medium" style={{ color: colors.label, fontSize: 17 }}>{title}</Text>
                <Text style={{ color: colors.secondaryLabel, fontSize: 15 }}>
                  {description}
                </Text>
              </View>
            </View>
            <Icon as={ChevronRight} size={14} color={colors.tertiaryLabel} />
          </View>
        </View>
      )}
    </Pressable>
  );
}
