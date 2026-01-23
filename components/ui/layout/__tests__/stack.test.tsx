import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { View } from 'react-native';
import { HStack, VStack } from '../stack';

describe('Stack', () => {
  it('renders HStack with gap, alignment, and wrap', () => {
    render(
      <HStack testID="stack" gap="md" align="center" justify="between" wrap>
        <View />
      </HStack>
    );

    expect(screen.getByTestId('stack')).toBeTruthy();
  });

  it('renders VStack and HStack with correct structure', () => {
    render(
      <VStack testID="vstack">
        <HStack testID="hstack">
          <View />
        </HStack>
      </VStack>
    );

    expect(screen.getByTestId('vstack')).toBeTruthy();
    expect(screen.getByTestId('hstack')).toBeTruthy();
  });
});
