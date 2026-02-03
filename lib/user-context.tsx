import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  initials: string;
};

type UserContextValue = {
  /** Current user profile */
  profile: UserProfile;
  /** Update user profile fields */
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'initials'>>) => void;
  /** Update user avatar */
  updateAvatar: (avatarUri: string | undefined) => void;
  /** Whether user data has been loaded from storage */
  isLoaded: boolean;
};

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  profile: '@user/profile',
};

// ============================================================================
// Default Profile
// ============================================================================

const DEFAULT_PROFILE: UserProfile = {
  id: 'current-user',
  name: 'John Smith',
  email: 'john.smith@company.com',
  phone: undefined,
  avatar: undefined,
  initials: 'JS',
};

// ============================================================================
// Helpers
// ============================================================================

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============================================================================
// Context & Provider
// ============================================================================

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
    (async () => {
      try {
        const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.profile);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile) as UserProfile;
          setProfile(parsed);
        }
      } catch (error) {
        console.warn('Failed to load user profile:', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<Omit<UserProfile, 'id' | 'initials'>>) => {
      setProfile((prev) => {
        const newName = updates.name ?? prev.name;
        const newProfile: UserProfile = {
          ...prev,
          ...updates,
          initials: updates.name ? getInitials(newName) : prev.initials,
        };
        AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(newProfile)).catch(console.warn);
        return newProfile;
      });
    },
    []
  );

  const updateAvatar = useCallback((avatarUri: string | undefined) => {
    setProfile((prev) => {
      const newProfile: UserProfile = {
        ...prev,
        avatar: avatarUri,
      };
      AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(newProfile)).catch(console.warn);
      return newProfile;
    });
  }, []);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      updateAvatar,
      isLoaded,
    }),
    [profile, updateProfile, updateAvatar, isLoaded]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
