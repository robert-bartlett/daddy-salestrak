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

// Export commonly used icons
module.exports = {
  Loader2: createMockIcon('Loader2'),
  // Add more icons as needed
  ArrowRight: createMockIcon('ArrowRight'),
  Bold: createMockIcon('Bold'),
  ChevronDown: createMockIcon('ChevronDown'),
  Copy: createMockIcon('Copy'),
  Italic: createMockIcon('Italic'),
  LogOut: createMockIcon('LogOut'),
  Mail: createMockIcon('Mail'),
  MoreHorizontal: createMockIcon('MoreHorizontal'),
  PlusCircle: createMockIcon('PlusCircle'),
  Settings: createMockIcon('Settings'),
  Trash2: createMockIcon('Trash2'),
  User: createMockIcon('User'),
  X: createMockIcon('X'),
};
