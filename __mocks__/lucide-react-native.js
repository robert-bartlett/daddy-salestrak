// Mock for lucide-react-native
// Provides stub implementations for Lucide icons used in tests

const React = require('react');
const { View } = require('react-native');

// Create a mock icon component factory
const createMockIcon = (name) => {
  const MockIcon = React.forwardRef(({ size, color, className, ...props }, ref) => {
    return React.createElement(View, {
      ref,
      testID: `icon-${name}`,
      ...props,
    });
  });
  MockIcon.displayName = name;
  return MockIcon;
};

// Cache for mocked icons
const iconCache = {};

// Use a Proxy to automatically create mock icons for any import
const mockIcons = new Proxy(
  {},
  {
    get: (target, prop) => {
      // Return cached icon or create new one
      if (typeof prop === 'string' && prop !== '__esModule') {
        if (!iconCache[prop]) {
          iconCache[prop] = createMockIcon(prop);
        }
        return iconCache[prop];
      }
      return undefined;
    },
  }
);

module.exports = mockIcons;
