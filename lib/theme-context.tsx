import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export type ColorMode = 'light' | 'dark';

export type AccentColor = 'blue' | 'purple' | 'teal' | 'green' | 'orange' | 'red' | 'pink';

type ThemeContextValue = {
  /** Current color mode (light/dark) */
  colorMode: ColorMode;
  /** Toggle between light and dark mode */
  toggleColorMode: () => void;
  /** Set specific color mode */
  setColorMode: (mode: ColorMode) => void;
  /** Current accent color */
  accentColor: AccentColor;
  /** Set accent color */
  setAccentColor: (color: AccentColor) => void;
  /** Get CSS class for current theme */
  themeClass: string;
};

// ============================================================================
// Accent Color Definitions (HSL values)
// ============================================================================

export const ACCENT_COLORS: Record<AccentColor, { label: string; hue: number }> = {
  blue: { label: 'Blue', hue: 217 },
  purple: { label: 'Purple', hue: 271 },
  teal: { label: 'Teal', hue: 173 },
  green: { label: 'Green', hue: 142 },
  orange: { label: 'Orange', hue: 25 },
  red: { label: 'Red', hue: 0 },
  pink: { label: 'Pink', hue: 330 },
};

// Primary accent colors (for buttons, badges, etc.)
export const ACCENT_COLOR_VALUES: Record<AccentColor, string> = {
  blue: '#3b82f6',
  purple: '#a855f7',
  teal: '#14b8a6',
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  pink: '#ec4899',
};

// Secondary accent colors (softer, for backgrounds and selected states)
export const ACCENT_COLOR_SECONDARY: Record<AccentColor, string> = {
  blue: 'rgba(59, 130, 246, 0.15)',
  purple: 'rgba(168, 85, 247, 0.15)',
  teal: 'rgba(20, 184, 166, 0.15)',
  green: 'rgba(34, 197, 94, 0.15)',
  orange: 'rgba(249, 115, 22, 0.15)',
  red: 'rgba(239, 68, 68, 0.15)',
  pink: 'rgba(236, 72, 153, 0.15)',
};

// Muted accent colors (for subtle highlights)
export const ACCENT_COLOR_MUTED: Record<AccentColor, string> = {
  blue: 'rgba(59, 130, 246, 0.25)',
  purple: 'rgba(168, 85, 247, 0.25)',
  teal: 'rgba(20, 184, 166, 0.25)',
  green: 'rgba(34, 197, 94, 0.25)',
  orange: 'rgba(249, 115, 22, 0.25)',
  red: 'rgba(239, 68, 68, 0.25)',
  pink: 'rgba(236, 72, 153, 0.25)',
};

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  colorMode: '@theme/colorMode',
  accentColor: '@theme/accentColor',
};

// ============================================================================
// Context & Provider
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with dark mode as default
  const [colorMode, setColorModeState] = useState<ColorMode>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedColorMode, savedAccentColor] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.colorMode),
          AsyncStorage.getItem(STORAGE_KEYS.accentColor),
        ]);

        if (savedColorMode === 'light' || savedColorMode === 'dark') {
          setColorModeState(savedColorMode);
        }

        if (savedAccentColor && savedAccentColor in ACCENT_COLORS) {
          setAccentColorState(savedAccentColor as AccentColor);
        }
      } catch (error) {
        console.warn('Failed to load theme preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Sync with system appearance API
  useEffect(() => {
    Appearance.setColorScheme(colorMode);
  }, [colorMode]);

  const toggleColorMode = useCallback(() => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEYS.colorMode, newMode).catch(console.warn);
  }, [colorMode]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.colorMode, mode).catch(console.warn);
  }, []);

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color);
    AsyncStorage.setItem(STORAGE_KEYS.accentColor, color).catch(console.warn);
  }, []);

  const themeClass = colorMode === 'dark' ? 'dark' : '';

  const value = useMemo(
    () => ({
      colorMode,
      toggleColorMode,
      setColorMode,
      accentColor,
      setAccentColor,
      themeClass,
    }),
    [colorMode, toggleColorMode, setColorMode, accentColor, setAccentColor, themeClass]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get the current accent color value.
 * Returns null if used outside ThemeProvider (for graceful fallback).
 */
export function useAccentColor(): string | null {
  const context = useContext(ThemeContext);
  if (!context) {
    return null;
  }
  return ACCENT_COLOR_VALUES[context.accentColor];
}

/**
 * Hook to get accent colors in multiple variants.
 * Returns object with primary, secondary, and muted accent colors.
 */
export function useAccentColors(): {
  primary: string;
  secondary: string;
  muted: string;
} | null {
  const context = useContext(ThemeContext);

  return useMemo(() => {
    if (!context) {
      return null;
    }
    return {
      primary: ACCENT_COLOR_VALUES[context.accentColor],
      secondary: ACCENT_COLOR_SECONDARY[context.accentColor],
      muted: ACCENT_COLOR_MUTED[context.accentColor],
    };
  }, [context?.accentColor]);
}
