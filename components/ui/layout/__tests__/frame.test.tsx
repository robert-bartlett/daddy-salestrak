import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Frame } from '../frame';
import { LayoutDebugProvider } from '../layout-debug-context';

describe('Frame', () => {
  describe('basic rendering', () => {
    it('renders children', () => {
      render(
        <Frame testID="frame">
          <View />
        </Frame>
      );

      expect(screen.getByTestId('frame')).toBeTruthy();
    });
  });

  describe('fill prop', () => {
    it('renders with fill={true}', () => {
      render(
        <Frame testID="frame" fill={true}>
          <View />
        </Frame>
      );

      expect(screen.getByTestId('frame')).toBeTruthy();
    });

    it('renders with fill="width"', () => {
      render(
        <Frame testID="frame" fill="width">
          <View />
        </Frame>
      );

      expect(screen.getByTestId('frame')).toBeTruthy();
    });

    it('renders with fill="height"', () => {
      render(
        <Frame testID="frame" fill="height">
          <View />
        </Frame>
      );

      expect(screen.getByTestId('frame')).toBeTruthy();
    });
  });

  describe('debug mode', () => {
    it('renders without debug border by default', () => {
      render(
        <Frame testID="frame">
          <View />
        </Frame>
      );

      expect(screen.getByTestId('frame')).toBeTruthy();
    });

    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <Frame testID="frame">
            <View />
          </Frame>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('frame')).toBeTruthy();
    });

    it('renders with custom debug border color', () => {
      render(
        <LayoutDebugProvider enabled borderColor="purple">
          <Frame testID="frame">
            <View />
          </Frame>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('frame')).toBeTruthy();
    });
  });
});
