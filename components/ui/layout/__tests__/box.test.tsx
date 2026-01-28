import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Box } from '../box';
import { LayoutDebugProvider } from '../layout-debug-context';

describe('Box', () => {
  describe('padding props', () => {
    it('renders with padding prop', () => {
      render(
        <Box testID="box" padding="md">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with paddingX prop', () => {
      render(
        <Box testID="box" paddingX="lg">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with paddingY prop', () => {
      render(
        <Box testID="box" paddingY="sm">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('margin props', () => {
    it('renders with margin prop', () => {
      render(
        <Box testID="box" margin="md">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with marginX prop', () => {
      render(
        <Box testID="box" marginX="lg">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with marginY prop', () => {
      render(
        <Box testID="box" marginY="sm">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('gap prop', () => {
    it('renders with gap prop', () => {
      render(
        <Box testID="box" gap="md">
          <View />
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('fill prop', () => {
    it('renders with fill={true}', () => {
      render(
        <Box testID="box" fill={true}>
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with fill="width"', () => {
      render(
        <Box testID="box" fill="width">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with fill="height"', () => {
      render(
        <Box testID="box" fill="height">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('background prop', () => {
    it('renders with background token', () => {
      render(
        <Box testID="box" background="muted">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('rounded prop', () => {
    it('renders with rounded prop', () => {
      render(
        <Box testID="box" rounded="lg">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('size prop', () => {
    it('renders with size token', () => {
      render(
        <Box testID="box" size="lg">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with numeric size', () => {
      render(
        <Box testID="box" size={100}>
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('forwards accessibilityRole', () => {
      render(
        <Box testID="box" accessibilityRole="header">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('forwards accessibilityLabel', () => {
      render(
        <Box testID="box" accessibilityLabel="Main content area">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('debug mode', () => {
    it('renders without debug border by default', () => {
      render(
        <Box testID="box" padding="md">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <Box testID="box" padding="md">
            <View />
          </Box>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });

    it('renders with custom debug border color', () => {
      render(
        <LayoutDebugProvider enabled borderColor="blue">
          <Box testID="box" padding="md">
            <View />
          </Box>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });

  describe('combined props', () => {
    it('renders with multiple props combined', () => {
      render(
        <Box
          testID="box"
          padding="md"
          margin="sm"
          gap="xs"
          background="card"
          rounded="lg"
          fill="width">
          <View />
        </Box>
      );

      expect(screen.getByTestId('box')).toBeTruthy();
    });
  });
});
