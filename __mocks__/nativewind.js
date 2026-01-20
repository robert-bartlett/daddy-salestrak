// Manual mock for nativewind
module.exports = {
  useColorScheme: () => ({ colorScheme: 'light', setColorScheme: jest.fn() }),
  vars: (obj) => obj,
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
};
