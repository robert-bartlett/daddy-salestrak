import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export type NotificationSettings = {
  pushEnabled: boolean;
  soundEnabled: boolean;
  badgesEnabled: boolean;
};

export type SyncInterval = '5min' | '15min' | '30min' | '1hour' | 'manual';

export type DataSettings = {
  offlineModeEnabled: boolean;
  autoSyncEnabled: boolean;
  syncInterval: SyncInterval;
};

type SettingsContextValue = {
  /** Notification preferences */
  notifications: NotificationSettings;
  /** Data & storage preferences */
  data: DataSettings;
  /** Update notification settings */
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  /** Update data settings */
  updateDataSettings: (updates: Partial<DataSettings>) => void;
  /** Clear all cached data */
  clearCache: () => Promise<void>;
  /** Whether settings have been loaded from storage */
  isLoaded: boolean;
};

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  notifications: '@settings/notifications',
  data: '@settings/data',
};

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  soundEnabled: true,
  badgesEnabled: true,
};

const DEFAULT_DATA_SETTINGS: DataSettings = {
  offlineModeEnabled: false,
  autoSyncEnabled: true,
  syncInterval: '15min',
};

// ============================================================================
// Sync Interval Display Labels
// ============================================================================

export const SYNC_INTERVAL_LABELS: Record<SyncInterval, string> = {
  '5min': 'Every 5 minutes',
  '15min': 'Every 15 minutes',
  '30min': 'Every 30 minutes',
  '1hour': 'Every hour',
  manual: 'Manual only',
};

// ============================================================================
// Context & Provider
// ============================================================================

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [data, setData] = useState<DataSettings>(DEFAULT_DATA_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedNotifications, savedData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.notifications),
          AsyncStorage.getItem(STORAGE_KEYS.data),
        ]);

        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications) as NotificationSettings);
        }

        if (savedData) {
          setData(JSON.parse(savedData) as DataSettings);
        }
      } catch (error) {
        console.warn('Failed to load settings:', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateNotificationSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setNotifications((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(updated)).catch(console.warn);
      return updated;
    });
  }, []);

  const updateDataSettings = useCallback((updates: Partial<DataSettings>) => {
    setData((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.data, JSON.stringify(updated)).catch(console.warn);
      return updated;
    });
  }, []);

  const clearCache = useCallback(async () => {
    try {
      // Get all keys and filter for cache-related ones
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(
        (key) =>
          key.startsWith('@cache/') ||
          key.startsWith('@offline/') ||
          key.startsWith('@temp/')
      );

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      data,
      updateNotificationSettings,
      updateDataSettings,
      clearCache,
      isLoaded,
    }),
    [notifications, data, updateNotificationSettings, updateDataSettings, clearCache, isLoaded]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
