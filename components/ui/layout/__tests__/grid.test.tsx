import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Box } from '../box';
import { Grid } from '../grid';

describe('Grid', () => {
  it('renders a grid with columns and gap', () => {
    render(
      <Grid testID="grid" columns={3} gap="sm">
        <Box />
        <Box />
      </Grid>
    );

    expect(screen.getByTestId('grid')).toBeTruthy();
  });
});
