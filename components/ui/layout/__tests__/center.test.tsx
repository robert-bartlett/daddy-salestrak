import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Center } from '../center';

describe('Center', () => {
  it('renders and centers content by default', () => {
    render(
      <Center testID="center">
        <View />
      </Center>
    );

    expect(screen.getByTestId('center')).toBeTruthy();
  });

  it('renders with horizontal prop', () => {
    render(
      <Center testID="center" horizontal>
        <View />
      </Center>
    );

    expect(screen.getByTestId('center')).toBeTruthy();
  });
});
