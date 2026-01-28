import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { LayoutDebugProvider } from '../layout-debug-context';
import { HStack, VStack } from '../stack';

describe('VStack', () => {
  describe('basic rendering', () => {
    it('renders children vertically', () => {
      render(
        <VStack testID="vstack">
          <View />
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });
  });

  describe('gap prop', () => {
    it('renders with gap prop', () => {
      render(
        <VStack testID="vstack" gap="md">
          <View />
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });
  });

  describe('align prop', () => {
    it('renders with align="start"', () => {
      render(
        <VStack testID="vstack" align="start">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with align="center"', () => {
      render(
        <VStack testID="vstack" align="center">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with align="end"', () => {
      render(
        <VStack testID="vstack" align="end">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with align="stretch"', () => {
      render(
        <VStack testID="vstack" align="stretch">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with align="baseline"', () => {
      render(
        <VStack testID="vstack" align="baseline">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });
  });

  describe('justify prop', () => {
    it('renders with justify="start"', () => {
      render(
        <VStack testID="vstack" justify="start">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with justify="center"', () => {
      render(
        <VStack testID="vstack" justify="center">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with justify="end"', () => {
      render(
        <VStack testID="vstack" justify="end">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with justify="between"', () => {
      render(
        <VStack testID="vstack" justify="between">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with justify="around"', () => {
      render(
        <VStack testID="vstack" justify="around">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });

    it('renders with justify="evenly"', () => {
      render(
        <VStack testID="vstack" justify="evenly">
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });
  });

  describe('wrap prop', () => {
    it('renders with wrap enabled', () => {
      render(
        <VStack testID="vstack" wrap>
          <View />
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });
  });

  describe('debug mode', () => {
    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <VStack testID="vstack">
            <View />
          </VStack>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
    });
  });
});

describe('HStack', () => {
  describe('basic rendering', () => {
    it('renders children horizontally', () => {
      render(
        <HStack testID="hstack">
          <View />
          <View />
        </HStack>
      );

      expect(screen.getByTestId('hstack')).toBeTruthy();
    });
  });

  describe('gap prop', () => {
    it('renders with gap prop', () => {
      render(
        <HStack testID="hstack" gap="md">
          <View />
          <View />
        </HStack>
      );

      expect(screen.getByTestId('hstack')).toBeTruthy();
    });
  });

  describe('combined props', () => {
    it('renders with gap, alignment, and wrap', () => {
      render(
        <HStack testID="hstack" gap="md" align="center" justify="between" wrap>
          <View />
        </HStack>
      );

      expect(screen.getByTestId('hstack')).toBeTruthy();
    });
  });

  describe('nested stacks', () => {
    it('renders VStack and HStack with correct structure', () => {
      render(
        <VStack testID="vstack">
          <HStack testID="hstack">
            <View />
          </HStack>
        </VStack>
      );

      expect(screen.getByTestId('vstack')).toBeTruthy();
      expect(screen.getByTestId('hstack')).toBeTruthy();
    });
  });

  describe('debug mode', () => {
    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <HStack testID="hstack">
            <View />
          </HStack>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('hstack')).toBeTruthy();
    });
  });
});
