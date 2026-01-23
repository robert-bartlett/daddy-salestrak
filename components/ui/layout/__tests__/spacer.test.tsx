import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Spacer } from '../spacer';

describe('Spacer', () => {
  it('renders a flexible spacer by default', () => {
    render(<Spacer testID="spacer" />);

    expect(screen.getByTestId('spacer')).toBeTruthy();
  });

  it('renders a fixed spacer with size token via style', () => {
    render(<Spacer testID="spacer" size="md" />);

    const style = screen.getByTestId('spacer').getAttribute('style') ?? '';
    expect(style).toContain('height');
  });
});
