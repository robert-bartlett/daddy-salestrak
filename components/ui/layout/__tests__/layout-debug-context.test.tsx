import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Text, View } from 'react-native';
import { LayoutDebugProvider, useDebugStyle } from '../layout-debug-context';

const TestComponent = () => {
  const debugStyle = useDebugStyle();
  const enabled = debugStyle !== undefined;
  const borderColor = debugStyle?.borderColor as string | undefined;
  return (
    <View testID="test-component">
      <Text testID="enabled-value">{enabled ? 'true' : 'false'}</Text>
      <Text testID="color-value">{borderColor ?? 'default'}</Text>
    </View>
  );
};

describe('LayoutDebugProvider', () => {
  describe('default context', () => {
    it('provides enabled=false by default when no provider', () => {
      render(<TestComponent />);

      expect(screen.getByTestId('enabled-value').textContent).toBe('false');
    });
  });

  describe('enabled prop', () => {
    it('provides enabled=true when provider has enabled={true}', () => {
      render(
        <LayoutDebugProvider enabled={true}>
          <TestComponent />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('enabled-value').textContent).toBe('true');
    });

    it('provides enabled=true when provider has enabled (shorthand)', () => {
      render(
        <LayoutDebugProvider enabled>
          <TestComponent />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('enabled-value').textContent).toBe('true');
    });

    it('provides enabled=false when provider has enabled={false}', () => {
      render(
        <LayoutDebugProvider enabled={false}>
          <TestComponent />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('enabled-value').textContent).toBe('false');
    });
  });

  describe('borderColor prop', () => {
    it('uses default borderColor when not specified', () => {
      render(
        <LayoutDebugProvider enabled>
          <TestComponent />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('color-value').textContent).toBe('rgba(255,0,0,0.3)');
    });

    it('provides custom borderColor when specified', () => {
      render(
        <LayoutDebugProvider enabled borderColor="blue">
          <TestComponent />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('color-value').textContent).toBe('blue');
    });

    it('provides RGBA borderColor when specified', () => {
      render(
        <LayoutDebugProvider enabled borderColor="rgba(0,0,255,0.5)">
          <TestComponent />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('color-value').textContent).toBe('rgba(0,0,255,0.5)');
    });
  });

  describe('nesting', () => {
    it('inner provider overrides outer provider', () => {
      render(
        <LayoutDebugProvider enabled borderColor="red">
          <LayoutDebugProvider enabled={false}>
            <TestComponent />
          </LayoutDebugProvider>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('enabled-value').textContent).toBe('false');
    });
  });
});
