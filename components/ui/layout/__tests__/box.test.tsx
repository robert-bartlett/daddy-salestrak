import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Box } from '../box';

describe('Box', () => {
  it('renders with padding, border, and rounded props', () => {
    render(
      <Box testID="box" padding="md" border rounded="lg">
        <View />
      </Box>
    );

    expect(screen.getByTestId('box')).toBeTruthy();
  });

  it('accepts custom background colors via style', () => {
    render(
      <Box testID="box" background="#ff0000">
        <View />
      </Box>
    );

    const style = screen.getByTestId('box').getAttribute('style') ?? '';
    expect(style).toContain('background-color');
  });
});
