import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Frame } from '../frame';

describe('Frame', () => {
  it('renders with fill and direction props', () => {
    render(
      <Frame testID="frame" fill direction="row">
        <View />
      </Frame>
    );

    expect(screen.getByTestId('frame')).toBeTruthy();
  });
});
