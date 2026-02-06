import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { ProjectForm } from './components/_project-form';

/**
 * Native iOS Create Project Sheet
 * Stacks on top of add-sheet when user selects "Project"
 */
export default function CreateProjectSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();

  // Parse coordinates from params if provided
  const coordinates = params.lat && params.lng
    ? { latitude: parseFloat(params.lat), longitude: parseFloat(params.lng) }
    : undefined;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ProjectForm
      coordinates={coordinates}
      onBack={handleBack}
    />
  );
}
