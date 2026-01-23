import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Surface } from '../surface';

describe('Surface', () => {
  it('renders elevated variant with padding and rounded', () => {
    render(
      <Surface testID="surface" variant="elevated" padding="md" rounded="xl">
        <View />
      </Surface>
    );

    expect(screen.getByTestId('surface')).toBeTruthy();
  });
});
