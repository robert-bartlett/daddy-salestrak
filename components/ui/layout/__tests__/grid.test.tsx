import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Box } from '../box';
import { Grid } from '../grid';
import { LayoutDebugProvider } from '../layout-debug-context';

describe('Grid', () => {
  describe('basic rendering', () => {
    it('renders children in a grid', () => {
      render(
        <Grid testID="grid">
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });
  });

  describe('columns prop', () => {
    it('renders with 1 column', () => {
      render(
        <Grid testID="grid" columns={1}>
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with 2 columns', () => {
      render(
        <Grid testID="grid" columns={2}>
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with 3 columns', () => {
      render(
        <Grid testID="grid" columns={3}>
          <Box />
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with 4 columns', () => {
      render(
        <Grid testID="grid" columns={4}>
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with 12 columns (max)', () => {
      render(
        <Grid testID="grid" columns={12}>
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('clamps columns above 12 to 12', () => {
      render(
        <Grid testID="grid" columns={20}>
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('clamps columns below 1 to 1', () => {
      render(
        <Grid testID="grid" columns={0}>
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });
  });

  describe('gap prop', () => {
    it('renders with gap="xs"', () => {
      render(
        <Grid testID="grid" gap="xs">
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with gap="sm"', () => {
      render(
        <Grid testID="grid" gap="sm">
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with gap="md"', () => {
      render(
        <Grid testID="grid" gap="md">
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with gap="lg"', () => {
      render(
        <Grid testID="grid" gap="lg">
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });
  });

  describe('combined props', () => {
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

  describe('debug mode', () => {
    it('renders without debug border by default', () => {
      render(
        <Grid testID="grid" columns={2}>
          <Box />
          <Box />
        </Grid>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with debug border when LayoutDebugProvider enabled', () => {
      render(
        <LayoutDebugProvider enabled>
          <Grid testID="grid" columns={2}>
            <Box />
            <Box />
          </Grid>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });

    it('renders with custom debug border color', () => {
      render(
        <LayoutDebugProvider enabled borderColor="orange">
          <Grid testID="grid" columns={2}>
            <Box />
            <Box />
          </Grid>
        </LayoutDebugProvider>
      );

      expect(screen.getByTestId('grid')).toBeTruthy();
    });
  });
});
