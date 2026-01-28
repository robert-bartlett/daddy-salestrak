import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { LayoutDebugProvider } from '../layout-debug-context';
import { Spacer } from '../spacer';

describe('Spacer', () => {
  describe('flexible spacer', () => {
    it('renders a flexible spacer by default (no size)', () => {
      render(<Spacer testID="spacer" />);

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });
  });

  describe('size prop', () => {
    it('renders with size="xs"', () => {
      render(<Spacer testID="spacer" size="xs" />);

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });

    it('renders with size="sm"', () => {
      render(<Spacer testID="spacer" size="sm" />);

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });

    it('renders with size="md"', () => {
      render(<Spacer testID="spacer" size="md" />);

      const style = screen.getByTestId('spacer').getAttribute('style') ?? '';
      expect(style).toContain('height');
    });

    it('renders with size="lg"', () => {
      render(<Spacer testID="spacer" size="lg" />);

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });

    it('renders with size="xl"', () => {
      render(<Spacer testID="spacer" size="xl" />);

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });

    it('renders with size="2xl"', () => {
      render(<Spacer testID="spacer" size="2xl" />);

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });
  });

  describe('direction prop', () => {
    it('renders with direction="vertical" (default)', () => {
      render(<Spacer testID="spacer" size="md" direction="vertical" />);

      const style = screen.getByTestId('spacer').getAttribute('style') ?? '';
      expect(style).toContain('height');
    });

    it('renders with direction="horizontal"', () => {
      render(<Spacer testID="spacer" size="md" direction="horizontal" />);

      const style = screen.getByTestId('spacer').getAttribute('style') ?? '';
      expect(style).toContain('width');
    });
  });

  describe('debug mode', () => {
    it('renders without debug border by default', () => {
      render(<Spacer testID="spacer" />);

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });

    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <Spacer testID="spacer" />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });

    it('renders fixed spacer with debug border', () => {
      render(
        <LayoutDebugProvider enabled>
          <Spacer testID="spacer" size="md" />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });

    it('renders with custom debug border color', () => {
      render(
        <LayoutDebugProvider enabled borderColor="yellow">
          <Spacer testID="spacer" size="lg" />
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('spacer')).toBeTruthy();
    });
  });
});
