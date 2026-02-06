import { useState, useCallback, useEffect } from 'react';
import { View, useColorScheme, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { X, Star } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { ProjectDetailContent, NoteInputFooter } from './components/_project-detail';

/**
 * Native iOS Project Sheet
 *
 * Presented as a native formSheet with:
 * - Native iOS frosted glass blur effect
 * - Native detent snapping (50%, 100%)
 * - Native drag handle
 * - iOS system colors
 */
export default function ProjectSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const projectId = params.id;

  const { getProjectById, toggleFavorite } = useProjects();

  // Get color scheme for iOS styling
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);

  // Activity tab state
  const [showActivity, setShowActivity] = useState(false);

  // Mount delay for native sheet timing
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const project = getProjectById(projectId);

  const handleDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(projectId);
  }, [toggleFavorite, projectId]);

  // Placeholder while mounting
  if (!isMounted) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
      />
    );
  }

  // Project not found
  if (!project) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)', padding: 20 }}
      >
        <Text style={{ color: colors.subtitle }}>Project not found</Text>
      </BlurView>
    );
  }

  // Detail View - Full project details with tabs and frosted glass
  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      {/* Glass Action Buttons */}
      <View
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 100,
          flexDirection: 'row',
          gap: 8,
        }}
      >
        {/* Favorite Button */}
        <Pressable onPress={handleToggleFavorite}>
          {({ pressed }) => (
            <GlassView
              glassEffectStyle="regular"
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              }}
            >
              <Icon
                as={Star}
                size={18}
                color={project.isFavorite ? '#FFD700' : '#FFFFFF'}
                fill={project.isFavorite ? '#FFD700' : 'none'}
              />
            </GlassView>
          )}
        </Pressable>

        {/* Close Button */}
        <Pressable onPress={handleDismiss}>
          {({ pressed }) => (
            <GlassView
              glassEffectStyle="regular"
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              }}
            >
              <Icon as={X} size={18} color="#FFFFFF" />
            </GlassView>
          )}
        </Pressable>
      </View>

      {/* Project Detail Content */}
      <View style={{ flex: 1 }}>
        <ProjectDetailContent
          projectId={project.id}
          showActivity={showActivity}
          hideFooter
          useNativeScroll
          hideFavoriteButton
          topPadding={16}
          onActiveTabChange={(tab) => setShowActivity(tab === 'activity')}
        />
      </View>

      {/* Note Input Footer (when in activity view) */}
      {showActivity ? (
        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: colors.separator,
            backgroundColor: 'rgba(30, 30, 30, 0.5)',
            padding: 16,
            paddingBottom: 16 + insets.bottom,
          }}
        >
          <NoteInputFooter projectId={project.id} />
        </View>
      ) : null}
    </BlurView>
  );
}
