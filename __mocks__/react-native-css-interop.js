// Manual mock for react-native-css-interop
module.exports = {
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
  createInteropElement: jest.fn(),
  useColorScheme: () => ({ colorScheme: 'light', setColorScheme: jest.fn() }),
  vars: (obj) => obj,
  StyleSheet: {
    create: (styles) => styles,
  },
};
