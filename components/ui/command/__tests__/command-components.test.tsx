import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../index';

describe('Command components', () => {
  it('filters items based on search input', async () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." hideIcon />
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'app' }, nativeEvent: { text: 'app' } });

    await waitFor(() => {
      expect(screen.queryByText('Banana')).toBeNull();
    });
    expect(screen.getByText('Apple')).toBeTruthy();
  });

  it('moves selection to the first visible item when filtered', async () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." hideIcon />
        <CommandList>
          <CommandItem value="apple" testID="item-apple">
            Apple
          </CommandItem>
          <CommandItem value="banana" testID="item-banana">
            Banana
          </CommandItem>
        </CommandList>
      </Command>
    );

    fireEvent.click(screen.getByTestId('item-banana'));
    expect(screen.getByTestId('item-banana').getAttribute('data-selected')).toBe('');

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'app' }, nativeEvent: { text: 'app' } });

    await waitFor(() => {
      expect(screen.getByTestId('item-apple').getAttribute('data-selected')).toBe('');
    });
  });

  it('shows CommandEmpty when no items match search', async () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." hideIcon />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'xyz' }, nativeEvent: { text: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText('No results found.')).toBeTruthy();
    });
  });

  it('hides CommandGroup when all children are filtered out', async () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." hideIcon />
        <CommandList>
          <CommandGroup heading="Fruits" data-testid="group-fruits">
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Vegetables" data-testid="group-vegetables">
            <CommandItem value="carrot">Carrot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'apple' }, nativeEvent: { text: 'apple' } });

    await waitFor(() => {
      expect(screen.queryByText('Vegetables')).toBeNull();
    });
    expect(screen.getByText('Fruits')).toBeTruthy();
  });

  it('selects first item by default', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." hideIcon />
        <CommandList>
          <CommandItem value="first" testID="item-first">First</CommandItem>
          <CommandItem value="second" testID="item-second">Second</CommandItem>
          <CommandItem value="third" testID="item-third">Third</CommandItem>
        </CommandList>
      </Command>
    );

    // First item should be selected by default
    expect(screen.getByTestId('item-first').getAttribute('data-selected')).toBe('');
    expect(screen.getByTestId('item-second').getAttribute('data-selected')).toBeNull();
    expect(screen.getByTestId('item-third').getAttribute('data-selected')).toBeNull();
  });

  it('calls onSelect when item is clicked', async () => {
    const onSelect = jest.fn();

    render(
      <Command>
        <CommandInput placeholder="Search..." hideIcon />
        <CommandList>
          <CommandItem value="action" testID="item-action" onSelect={onSelect}>
            Action
          </CommandItem>
        </CommandList>
      </Command>
    );

    fireEvent.click(screen.getByTestId('item-action'));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('action');
    });
  });
});
