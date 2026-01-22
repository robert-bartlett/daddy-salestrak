// Mock for react-native-reanimated
// This mock provides stub implementations for all Reanimated APIs used in the codebase

const React = require('react');
const { View, Text, Image, ScrollView, FlatList } = require('react-native');

// createAnimatedComponent returns the component unchanged for testing
const createAnimatedComponent = (Component) => Component;

// Animated namespace with common React Native components
const Animated = {
  View: createAnimatedComponent(View),
  Text: createAnimatedComponent(Text),
  Image: createAnimatedComponent(Image),
  ScrollView: createAnimatedComponent(ScrollView),
  FlatList: createAnimatedComponent(FlatList),
  createAnimatedComponent,
};

module.exports = {
  default: Animated,
  // Re-export Animated as default
  ...Animated,
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
  useDerivedValue: jest.fn((fn) => ({ value: fn() })),
  // Animation functions
  withTiming: jest.fn((val) => val),
  withSpring: jest.fn((val) => val),
  withRepeat: jest.fn((animation) => animation),
  // Easing
  Easing: {
    bezier: jest.fn(() => jest.fn()),
    ease: jest.fn(),
    linear: jest.fn(),
  },
};
