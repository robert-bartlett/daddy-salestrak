module.exports = {
  preset: 'jest-expo/web',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@rn-primitives/.*|nativewind|react-native-css-interop|react-native-reanimated|lucide-react-native|class-variance-authority)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native-css-interop$': '<rootDir>/__mocks__/react-native-css-interop.js',
    '^nativewind$': '<rootDir>/__mocks__/nativewind.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
  },
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)', '**/*.(test|spec).[jt]s?(x)'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'components/ui/sidebar/**/*.{ts,tsx}',
    '!components/ui/sidebar/index.ts',
    '!**/*.d.ts',
  ],
};
