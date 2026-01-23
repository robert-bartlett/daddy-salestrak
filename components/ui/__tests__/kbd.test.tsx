import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Kbd, formatKey } from '../kbd';

describe('Kbd', () => {
  describe('formatKey helper', () => {
    it('converts modifier keys to symbols', () => {
      expect(formatKey('cmd')).toBe('⌘');
      expect(formatKey('Command')).toBe('⌘');
      expect(formatKey('shift')).toBe('⇧');
      expect(formatKey('alt')).toBe('⌥');
      expect(formatKey('ctrl')).toBe('⌃');
    });

    it('converts special keys to symbols', () => {
      expect(formatKey('enter')).toBe('↵');
      expect(formatKey('backspace')).toBe('⌫');
      expect(formatKey('tab')).toBe('⇥');
      expect(formatKey('up')).toBe('↑');
    });

    it('uppercases unknown keys', () => {
      expect(formatKey('k')).toBe('K');
      expect(formatKey('v')).toBe('V');
    });

    it('handles case insensitivity', () => {
      expect(formatKey('CMD')).toBe('⌘');
      expect(formatKey('Shift')).toBe('⇧');
    });
  });

  describe('single key rendering', () => {
    it('renders single key via children', () => {
      render(<Kbd testID="kbd">K</Kbd>);
      expect(screen.getByTestId('kbd')).toBeTruthy();
      expect(screen.getByText('K')).toBeTruthy();
    });

    it('converts symbol via children', () => {
      render(<Kbd testID="kbd">Cmd</Kbd>);
      expect(screen.getByText('⌘')).toBeTruthy();
    });
  });

  describe('key combinations', () => {
    it('renders multiple keys with separator', () => {
      render(<Kbd testID="kbd" keys={['Cmd', 'K']} />);
      expect(screen.getByText('⌘')).toBeTruthy();
      expect(screen.getByText('+')).toBeTruthy();
      expect(screen.getByText('K')).toBeTruthy();
    });

    it('renders three-key combination', () => {
      render(<Kbd testID="kbd" keys={['Cmd', 'Shift', 'P']} />);
      expect(screen.getByText('⌘')).toBeTruthy();
      expect(screen.getByText('⇧')).toBeTruthy();
      expect(screen.getByText('P')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Kbd testID="kbd" size="sm">K</Kbd>);
      expect(screen.getByTestId('kbd')).toBeTruthy();
    });

    it('renders default size', () => {
      render(<Kbd testID="kbd" size="default">K</Kbd>);
      expect(screen.getByTestId('kbd')).toBeTruthy();
    });

    it('renders large size', () => {
      render(<Kbd testID="kbd" size="lg">K</Kbd>);
      expect(screen.getByTestId('kbd')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('returns null when no children or keys', () => {
      render(<Kbd testID="kbd" />);
      expect(screen.queryByTestId('kbd')).toBeNull();
    });

    it('prefers keys array over children', () => {
      render(<Kbd testID="kbd" keys={['Cmd', 'V']}>X</Kbd>);
      expect(screen.queryByText('X')).toBeNull();
      expect(screen.getByText('⌘')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('renders as accessible element', () => {
      render(<Kbd testID="kbd">K</Kbd>);
      const kbd = screen.getByTestId('kbd');
      expect(kbd).toBeTruthy();
    });

    it('has descriptive label for combinations', () => {
      render(<Kbd testID="kbd" keys={['Cmd', 'K']} />);
      // React Native Web maps accessibilityLabel to aria-label in the DOM
      const kbd = screen.getByLabelText('Cmd plus K');
      expect(kbd).toBeTruthy();
    });
  });
});
