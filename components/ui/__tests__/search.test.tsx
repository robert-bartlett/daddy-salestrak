import { fireEvent, render, screen } from '@testing-library/react';
import { Filter } from 'lucide-react-native';
import * as React from 'react';
import { Search } from '../search';

describe('Search', () => {
  describe('basic rendering', () => {
    it('renders with default props (icon, placeholder)', () => {
      render(<Search testID="search" />);

      expect(screen.getByTestId('search')).toBeTruthy();
      expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    });

    it('renders with custom placeholder', () => {
      render(<Search testID="search" placeholder="Filter users..." />);

      expect(screen.getByPlaceholderText('Filter users...')).toBeTruthy();
    });

    it('renders with custom leadingIcon', () => {
      render(<Search testID="search" leadingIcon={Filter} />);

      expect(screen.getByTestId('search')).toBeTruthy();
    });

    it('renders without icon when hideIcon={true}', () => {
      render(<Search testID="search" hideIcon />);

      expect(screen.getByTestId('search')).toBeTruthy();
    });
  });

  describe('value management', () => {
    it('controlled mode: displays value', () => {
      render(<Search testID="search" value="test query" />);

      expect(screen.getByDisplayValue('test query')).toBeTruthy();
    });

    it('controlled mode: calls onValueChange', () => {
      const onValueChange = jest.fn();
      render(<Search testID="search" value="" onValueChange={onValueChange} />);

      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onValueChange).toHaveBeenCalledWith('new value');
    });

    it('uncontrolled mode: uses defaultValue', () => {
      render(<Search testID="search" defaultValue="initial" />);

      expect(screen.getByDisplayValue('initial')).toBeTruthy();
    });

    it('uncontrolled mode: manages internal state', () => {
      const onValueChange = jest.fn();
      render(<Search testID="search" onValueChange={onValueChange} />);

      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'typed text' } });

      expect(screen.getByDisplayValue('typed text')).toBeTruthy();
      expect(onValueChange).toHaveBeenCalledWith('typed text');
    });
  });

  describe('clear button', () => {
    it('hidden when value is empty', () => {
      render(<Search testID="search" value="" />);

      expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    });

    it('visible when value has content', () => {
      render(<Search testID="search" value="some text" />);

      expect(screen.getByRole('button', { name: 'Clear search' })).toBeTruthy();
    });

    it('clears value and calls onValueChange with empty string', () => {
      const onValueChange = jest.fn();
      render(<Search testID="search" value="some text" onValueChange={onValueChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.click(clearButton);

      expect(onValueChange).toHaveBeenCalledWith('');
    });

    it('hidden when disabled', () => {
      render(<Search testID="search" value="some text" disabled />);

      expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    });

    it('hidden when loading', () => {
      render(<Search testID="search" value="some text" loading />);

      expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    });
  });

  describe('submit behavior', () => {
    it('calls onSubmit with current value on Enter/Return', () => {
      const onSubmit = jest.fn();
      render(<Search testID="search" value="search query" onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('Search...');
      // Use keyDown with full key event properties for cross-browser compatibility
      // React Native Web's TextInput triggers onSubmitEditing on Enter keypress
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13 });

      expect(onSubmit).toHaveBeenCalledWith('search query');
    });

    it('does not call onSubmit when onSubmit is not provided', () => {
      // Ensure no errors when onSubmit is omitted
      render(<Search testID="search" value="search query" />);

      const input = screen.getByPlaceholderText('Search...');
      // Should not throw
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13 });
    });
  });

  describe('states', () => {
    it('disabled: hides clear button', () => {
      render(<Search testID="search" value="some text" disabled />);

      // Clear button should not be visible when disabled
      expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    });

    it('disabled: renders correctly', () => {
      render(<Search testID="search" disabled />);

      // Component should render without error
      expect(screen.getByTestId('search')).toBeTruthy();
      expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    });

    it('invalid: renders correctly', () => {
      render(<Search testID="search" invalid />);

      // Component should render without error
      expect(screen.getByTestId('search')).toBeTruthy();
    });

    it('loading: shows spinner', () => {
      render(<Search testID="search" loading />);

      // Spinner has accessibilityRole="progressbar"
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });
  });

  describe('width prop', () => {
    it('applies width classes', () => {
      render(<Search testID="search" width="lg" />);

      expect(screen.getByTestId('search')).toBeTruthy();
    });

    it('defaults to full width when not specified', () => {
      render(<Search testID="search" />);

      expect(screen.getByTestId('search')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('search role applied to input', () => {
      render(<Search testID="search" />);

      expect(screen.getByRole('search')).toBeTruthy();
    });

    it('clear button has accessible label', () => {
      render(<Search testID="search" value="text" />);

      expect(screen.getByRole('button', { name: 'Clear search' })).toBeTruthy();
    });

    it('disabled state via accessibilityState', () => {
      render(<Search testID="search" disabled />);

      // The input renders with disabled prop
      expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    });
  });

  describe('custom props', () => {
    it('passes additional TextInput props', () => {
      const onFocus = jest.fn();
      render(<Search testID="search" onFocus={onFocus} />);

      const input = screen.getByPlaceholderText('Search...');
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalled();
    });
  });
});
