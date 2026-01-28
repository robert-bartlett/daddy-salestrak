import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { LayoutDebugProvider } from '../layout-debug-context';
import { Surface } from '../surface';

describe('Surface', () => {
  describe('variant prop', () => {
    it('renders with variant="card" (default)', () => {
      render(
        <Surface testID="surface">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with variant="elevated"', () => {
      render(
        <Surface testID="surface" variant="elevated">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with variant="muted"', () => {
      render(
        <Surface testID="surface" variant="muted">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with variant="outline"', () => {
      render(
        <Surface testID="surface" variant="outline">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with variant="ghost"', () => {
      render(
        <Surface testID="surface" variant="ghost">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });
  });

  describe('padding props', () => {
    it('renders with padding prop', () => {
      render(
        <Surface testID="surface" padding="md">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with paddingX prop', () => {
      render(
        <Surface testID="surface" paddingX="lg">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with paddingY prop', () => {
      render(
        <Surface testID="surface" paddingY="sm">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });
  });

  describe('rounded prop', () => {
    it('renders with rounded="lg" (default)', () => {
      render(
        <Surface testID="surface">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with rounded="none"', () => {
      render(
        <Surface testID="surface" rounded="none">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with rounded="xl"', () => {
      render(
        <Surface testID="surface" rounded="xl">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with rounded="full"', () => {
      render(
        <Surface testID="surface" rounded="full">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('forwards accessibilityRole', () => {
      render(
        <Surface testID="surface" accessibilityRole="header">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('forwards accessibilityLabel', () => {
      render(
        <Surface testID="surface" accessibilityLabel="Card section">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });
  });

  describe('combined props', () => {
    it('renders elevated variant with padding and rounded', () => {
      render(
        <Surface testID="surface" variant="elevated" padding="md" rounded="xl">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });
  });

  describe('debug mode', () => {
    it('renders without debug border by default', () => {
      render(
        <Surface testID="surface">
          <View />
        </Surface>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <Surface testID="surface">
            <View />
          </Surface>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });

    it('renders with custom debug border color', () => {
      render(
        <LayoutDebugProvider enabled borderColor="cyan">
          <Surface testID="surface">
            <View />
          </Surface>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('surface')).toBeTruthy();
    });
  });
});
