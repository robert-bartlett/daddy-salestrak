// Mock for react-native-reanimated
// This mock provides stub implementations for all Reanimated APIs used in the codebase

const React = require('react');

// createAnimatedComponent returns the component unchanged for testing
const createAnimatedComponent = (Component) => Component;

module.exports = {
  default: {
    call: jest.fn(),
    createAnimatedComponent,
  },
  // Re-export createAnimatedComponent for named import
  createAnimatedComponent,
  // Animation entering/exiting
  FadeIn: { duration: jest.fn().mockReturnThis(), reduceMotion: jest.fn().mockReturnThis() },
  FadeOut: { duration: jest.fn().mockReturnThis(), reduceMotion: jest.fn().mockReturnThis() },
  SlideInRight: { duration: jest.fn().mockReturnThis(), reduceMotion: jest.fn().mockReturnThis() },
  SlideOutRight: { duration: jest.fn().mockReturnThis(), reduceMotion: jest.fn().mockReturnThis() },
  SlideInLeft: { duration: jest.fn().mockReturnThis(), reduceMotion: jest.fn().mockReturnThis() },
  SlideOutLeft: { duration: jest.fn().mockReturnThis(), reduceMotion: jest.fn().mockReturnThis() },
  // Motion settings
  ReduceMotion: { System: 'system' },
  // Hooks
  useAnimatedStyle: jest.fn(() => ({})),
  useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
  // Animation functions
  withTiming: jest.fn((val) => val),
  withSpring: jest.fn((val) => val),
  // Easing
  Easing: {
    bezier: jest.fn(() => jest.fn()),
    ease: jest.fn(),
  },
};
