import { useState, useCallback, useEffect } from 'react';
import { View, Pressable, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { FolderKanban, UserCircle, Building2, ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getIOSSheetColors } from '@/lib/ios-colors';

type EntityOption = {
  id: string;
  icon: typeof FolderKanban;
  title: string;
  description: string;
  onPress: () => void;
};

/**
 * Native iOS Add Sheet - Entity Selection
 *
 * Presented as a native formSheet with:
 * - Native iOS frosted glass blur effect
 * - Native detent snapping (50%, 92%)
 * - Native drag handle
 *
 * Each form type is a separate route that stacks on top.
 */
export default function AddSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();

  // Parse coordinates from params if provided
  const coordinates = params.lat && params.lng
    ? { latitude: parseFloat(params.lat), longitude: parseFloat(params.lng) }
    : undefined;

  // If coordinates provided (map tap), go directly to project form
  useEffect(() => {
    if (coordinates) {
      router.replace({
        pathname: '/create-project-sheet',
        params: { lat: params.lat, lng: params.lng },
      });
    }
  }, [coordinates, params.lat, params.lng, router]);

  // Delay rendering to avoid "state update on unmounted component" with native sheets
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Get color scheme for proper theming
  const colorScheme = useColorScheme();
  const sheetColors = getIOSSheetColors(colorScheme);

  const navigateToForm = useCallback((formType: 'project' | 'contact' | 'account') => {
    router.push(`/create-${formType}-sheet` as any);
  }, [router]);

  // Wait for mount
  if (!isMounted || coordinates) {
    return <View style={{ flex: 1, backgroundColor: sheetColors.background }} />;
  }

  // Entity selection options
  const entityOptions: EntityOption[] = [
    {
      id: 'project',
      icon: FolderKanban,
      title: 'Project',
      description: 'Track a job, lead, or property',
      onPress: () => navigateToForm('project'),
    },
    {
      id: 'contact',
      icon: UserCircle,
      title: 'Contact',
      description: 'Add a person to your network',
      onPress: () => navigateToForm('contact'),
    },
    {
      id: 'account',
      icon: Building2,
      title: 'Account',
      description: 'Create a company or organization',
      onPress: () => navigateToForm('account'),
    },
  ];

  // Use iOS sheet colors from centralized config
  const colors = {
    sheetBackground: sheetColors.background,
    cardBackground: sheetColors.cardBackground,
    label: sheetColors.title,
    secondaryLabel: sheetColors.subtitle,
    tertiaryLabel: sheetColors.subtitle,
    separator: sheetColors.separator,
    tertiaryFill: sheetColors.iconBackground,
  };

  // Entity selection screen with frosted glass effect
  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
        {/* Header */}
        <Text size="lg" weight="semibold" style={{ color: colors.label }}>
          Create New
        </Text>

        {/* Entity options - iOS grouped style cards */}
        {entityOptions.map((option) => (
          <EntityOptionCard key={option.id} option={option} colors={colors} />
        ))}
      </View>
    </BlurView>
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
