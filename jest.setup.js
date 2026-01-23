// jest.setup.js
// This file runs after Jest's test environment is set up

// Note: react-native-reanimated mock is in __mocks__/react-native-reanimated.js
// and configured via moduleNameMapper in jest.config.js

// Mock lucide-react-native icons using Proxy to handle any icon
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createMockIcon = (name) => {
    const MockIcon = React.forwardRef((props, ref) =>
      React.createElement(View, { ref, testID: `icon-${name}`, ...props })
    );
    MockIcon.displayName = name;
    return MockIcon;
  };

  // Cache for icons
  const iconCache = {};

  return new Proxy(
    {},
    {
      get: (target, prop) => {
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
});

// Mock the useIsMobile hook directly
jest.mock('@/hooks/use-is-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

// Mock @rn-primitives/dialog
jest.mock('@rn-primitives/dialog', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Root: ({ children }) => children,
    Trigger: ({ children }) => children,
    Portal: ({ children }) => children,
    Overlay: ({ children }) => children,
    Content: ({ children }) => children,
    Close: ({ children }) => children,
    Title: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(Text, { ...props, ref }, children)
    ),
    Description: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(Text, { ...props, ref }, children)
    ),
  };
});

// Mock @rn-primitives/portal
jest.mock('@rn-primitives/portal', () => ({
  PortalHost: ({ children }) => children,
}));

// Mock @rn-primitives/popover
jest.mock('@rn-primitives/popover', () => {
  const React = require('react');
  const { View, Pressable } = require('react-native');

  return {
    Root: ({ children }) => children,
    Trigger: React.forwardRef(({ children, asChild, ...props }, ref) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { ref, ...props });
      }
      return React.createElement(Pressable, { ref, ...props }, children);
    }),
    Portal: ({ children }) => children,
    Overlay: ({ children }) => children,
    Content: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(View, { ref, ...props }, children)
    ),
  };
});

// Mock @rn-primitives/tooltip
jest.mock('@rn-primitives/tooltip', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Root: ({ children }) => children,
    Trigger: ({ children }) => children,
    Portal: ({ children }) => children,
    Content: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(View, { ...props, ref }, children)
    ),
    Overlay: ({ children }) => children,
  };
});

// Mock @rn-primitives/separator
jest.mock('@rn-primitives/separator', () => ({
  Root: ({ children, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props, children);
  },
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  FullWindowOverlay: ({ children }) => children,
}));

// Silence the warning about act() in tests
global.IS_REACT_ACT_ENVIRONMENT = true;

// Provide a press alias for DOM-based fireEvent in React Native tests.
const { fireEvent } = require('@testing-library/react');
if (!fireEvent.press) {
  fireEvent.press = fireEvent.click;
}
