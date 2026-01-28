import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Center } from '../center';
import { LayoutDebugProvider } from '../layout-debug-context';

describe('Center', () => {
  describe('basic rendering', () => {
    it('renders and centers content', () => {
      render(
        <Center testID="center">
          <View />
        </Center>
      );

      expect(screen.getByTestId('center')).toBeTruthy();
    });
  });

  describe('fill prop', () => {
    it('renders with fill={true}', () => {
      render(
        <Center testID="center" fill={true}>
          <View />
        </Center>
      );

      expect(screen.getByTestId('center')).toBeTruthy();
    });

    it('renders with fill="width"', () => {
      render(
        <Center testID="center" fill="width">
          <View />
        </Center>
      );

      expect(screen.getByTestId('center')).toBeTruthy();
    });

    it('renders with fill="height"', () => {
      render(
        <Center testID="center" fill="height">
          <View />
        </Center>
      );

      expect(screen.getByTestId('center')).toBeTruthy();
    });
  });

  describe('debug mode', () => {
    it('renders without debug border by default', () => {
      render(
        <Center testID="center">
          <View />
        </Center>
      );

      expect(screen.getByTestId('center')).toBeTruthy();
    });

    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <Center testID="center">
            <View />
          </Center>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('center')).toBeTruthy();
    });

    it('renders with custom debug border color', () => {
      render(
        <LayoutDebugProvider enabled borderColor="green">
          <Center testID="center">
            <View />
          </Center>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('center')).toBeTruthy();
    });
  });
});
