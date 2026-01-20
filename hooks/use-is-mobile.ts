import { useWindowDimensions } from 'react-native';

// Matches Tailwind's md breakpoint (768px)
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized.
 *
 * @returns `true` when viewport width is less than 768px (Tailwind's md breakpoint)
 *
 * @remarks
 * Uses React Native's `useWindowDimensions` which works on all platforms.
 * On web, this responds to viewport resize. On native, it responds to
 * device rotation.
 */
export function useIsMobile() {
  const { width } = useWindowDimensions();
  return width < MOBILE_BREAKPOINT;
}
