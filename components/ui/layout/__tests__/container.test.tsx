import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { Container } from '../container';

describe('Container', () => {
  it('renders with size and padding props', () => {
    render(
      <Container testID="container" size="md" padding="lg">
        <View />
      </Container>
    );

    expect(screen.getByTestId('container')).toBeTruthy();
  });
});
