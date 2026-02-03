import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ScreenPosition = 'search' | 'home' | 'inbox' | 'profile' | 'mywork' | 'settings';

type ScreenNavigationContextValue = {
  /** Currently active screen */
  activeScreen: ScreenPosition;
  /** Whether to skip animation on the next transition */
  skipAnimation: boolean;
  /** Navigate to the search screen */
  navigateToSearch: (options?: { skipAnimation?: boolean }) => void;
  /** Navigate to the inbox screen */
  navigateToInbox: () => void;
  /** Navigate to the profile screen */
  navigateToProfile: () => void;
  /** Navigate to the My Work screen */
  navigateToMyWork: () => void;
  /** Navigate to the settings screen */
  navigateToSettings: () => void;
  /** Navigate back to the home screen */
  navigateToHome: () => void;
  /** Clear the skip animation flag */
  clearSkipAnimation: () => void;
};

// ============================================================================
// Context & Provider
// ============================================================================

const ScreenNavigationContext = createContext<ScreenNavigationContextValue | null>(null);

export function ScreenNavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeScreen, setActiveScreen] = useState<ScreenPosition>('home');
  const [skipAnimation, setSkipAnimation] = useState(false);

  const navigateToSearch = useCallback((options?: { skipAnimation?: boolean }) => {
    if (options?.skipAnimation) {
      setSkipAnimation(true);
    }
    setActiveScreen('search');
  }, []);

  const navigateToInbox = useCallback(() => {
    setActiveScreen('inbox');
  }, []);

  const navigateToProfile = useCallback(() => {
    setActiveScreen('profile');
  }, []);

  const navigateToMyWork = useCallback(() => {
    setActiveScreen('mywork');
  }, []);

  const navigateToSettings = useCallback(() => {
    setActiveScreen('settings');
  }, []);

  const navigateToHome = useCallback(() => {
    setActiveScreen('home');
  }, []);

  const clearSkipAnimation = useCallback(() => {
    setSkipAnimation(false);
  }, []);

  const value = useMemo(
    () => ({
      activeScreen,
      skipAnimation,
      navigateToSearch,
      navigateToInbox,
      navigateToProfile,
      navigateToMyWork,
      navigateToSettings,
      navigateToHome,
      clearSkipAnimation,
    }),
    [activeScreen, skipAnimation, navigateToSearch, navigateToInbox, navigateToProfile, navigateToMyWork, navigateToSettings, navigateToHome, clearSkipAnimation]
  );

  return (
    <ScreenNavigationContext.Provider value={value}>
      {children}
    </ScreenNavigationContext.Provider>
  );
}

export function useScreenNavigation() {
  const context = useContext(ScreenNavigationContext);
  if (!context) {
    throw new Error('useScreenNavigation must be used within a ScreenNavigationProvider');
  }
  return context;
}
