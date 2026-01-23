module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
    es2021: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'build/'],
  rules: {
    'no-raw-styling-outside-ui': 'error',
    'react/react-in-jsx-scope': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-native',
            importNames: [
              'View',
              'Pressable',
              'ScrollView',
              'Text',
              'TextInput',
              'Image',
              'SafeAreaView',
              'FlatList',
              'SectionList',
              'Modal',
              'KeyboardAvoidingView',
              'TouchableOpacity',
              'TouchableHighlight',
              'TouchableWithoutFeedback',
            ],
            message:
              'Use layout/components from components/ui instead of raw react-native elements.',
          },
          {
            name: 'react-native-web',
            importNames: ['View', 'Pressable', 'ScrollView', 'Text', 'TextInput', 'Image'],
            message:
              'Use layout/components from components/ui instead of raw react-native-web elements.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.js', '*.config.js', '.eslintrc.js'],
      env: {
        node: true,
      },
    },
    {
      files: ['__mocks__/**/*.js', '**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', 'jest.setup.js'],
      env: {
        jest: true,
        node: true,
      },
      rules: {
        'no-raw-styling-outside-ui': 'off',
        'no-restricted-imports': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'react/prop-types': 'off',
      },
    },
    {
      files: ['components/ui/**/*.{ts,tsx}'],
      rules: {
        'no-raw-styling-outside-ui': 'off',
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['app/+html.tsx', 'app/_layout.tsx'],
      rules: {
        'no-raw-styling-outside-ui': 'off',
        'no-restricted-imports': 'off',
      },
    },
  ],
};
