import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Container } from '../container';
import { LayoutDebugProvider } from '../layout-debug-context';

describe('Container', () => {
  describe('size prop', () => {
    it('renders with size="sm"', () => {
      render(
        <Container testID="container" size="sm">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with size="md"', () => {
      render(
        <Container testID="container" size="md">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with size="lg" (default)', () => {
      render(
        <Container testID="container">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with size="xl"', () => {
      render(
        <Container testID="container" size="xl">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with size="2xl"', () => {
      render(
        <Container testID="container" size="2xl">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with size="full"', () => {
      render(
        <Container testID="container" size="full">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });
  });

  describe('padding props', () => {
    it('renders with padding prop', () => {
      render(
        <Container testID="container" padding="md">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with paddingX prop', () => {
      render(
        <Container testID="container" paddingX="lg">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with paddingY prop', () => {
      render(
        <Container testID="container" paddingY="sm">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('forwards accessibilityRole', () => {
      render(
        <Container testID="container" accessibilityRole="header">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('forwards accessibilityLabel', () => {
      render(
        <Container testID="container" accessibilityLabel="Main content">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });
  });

  describe('combined props', () => {
    it('renders with size and padding props', () => {
      render(
        <Container testID="container" size="md" padding="lg">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });
  });

  describe('debug mode', () => {
    it('renders without debug border by default', () => {
      render(
        <Container testID="container">
          <View />
        </Container>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <Container testID="container">
            <View />
          </Container>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });

    it('renders with custom debug border color', () => {
      render(
        <LayoutDebugProvider enabled borderColor="magenta">
          <Container testID="container">
            <View />
          </Container>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('container')).toBeTruthy();
    });
  });
});
